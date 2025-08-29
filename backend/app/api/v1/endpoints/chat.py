from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from typing import Dict, Any, List, Optional
from datetime import datetime
from loguru import logger
from bson import ObjectId
from app.api.v1.endpoints.auth import get_current_user
from app.models.user import User
from app.models.conversation import Message, MessageRole, Conversation, ConversationCreate, EmotionalTone
from app.core.database import get_conversations_collection, get_users_collection
from app.rag.simple_rag import simple_rag_engine as rag_engine
from app.mental_health.mood_detector import mood_detector, crisis_intervention
from app.core.security import sanitize_user_input, mask_sensitive_info
import json
import asyncio
from uuid import uuid4

router = APIRouter()

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        logger.info(f"WebSocket connected for user: {user_id}")
    
    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            logger.info(f"WebSocket disconnected for user: {user_id}")
    
    async def send_message(self, user_id: str, message: dict):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_json(message)
    
    async def broadcast(self, message: dict):
        for connection in self.active_connections.values():
            await connection.send_json(message)

manager = ConnectionManager()

from pydantic import BaseModel

class MessageRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None

@router.post("/message")
async def send_message(
    request: MessageRequest,
    current_user: User = Depends(get_current_user)
):
    """Send message and get AI response"""
    try:
        # Extract message from request
        message = request.message
        conversation_id = request.conversation_id
        
        # Sanitize input
        try:
            message = sanitize_user_input(message)
        except:
            # If sanitize fails, just strip and check
            message = message.strip()
        
        if not message:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Message cannot be empty"
            )
        
        # Mask sensitive information
        try:
            masked_message = mask_sensitive_info(message)
        except:
            masked_message = message
        
        try:
            conversations_collection = get_conversations_collection()
            users_collection = get_users_collection()
            database_available = True
        except RuntimeError:
            database_available = False
            logger.warning("Database not available")
        
        if database_available:
            # Get or create conversation
            if conversation_id:
                conversation = await conversations_collection.find_one({
                    "id": conversation_id,
                    "user_id": current_user.id
                })
                
                if not conversation:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Conversation not found"
                    )
            else:
                # Create new conversation
                conversation = {
                    "id": str(uuid4()),
                    "user_id": current_user.id,
                    "started_at": datetime.utcnow(),
                    "last_activity": datetime.utcnow(),
                    "status": "active",
                    "messages": [],
                    "message_count": 0,
                    "risk_score": 0.0,
                    "crisis_detected": False,
                    "identified_topics": [],
                    "therapeutic_goals": [],
                    "recommended_exercises": [],
                    "total_tokens_used": 0
                }
                
                await conversations_collection.insert_one(conversation)
            
            # Perform mood detection
            try:
                mood_analysis = mood_detector.detect_mood(message)
            except:
                mood_analysis = {
                    "mood_state": "neutral",
                    "sentiment_scores": {"compound": 0.0},
                    "emotions": {}
                }
            
            # Check for crisis
            try:
                crisis_assessment = crisis_intervention.assess_crisis(
                    message,
                    {
                        "recent_crisis_flags": len(current_user.crisis_flags),
                        "risk_level": current_user.risk_level
                    }
                )
            except:
                crisis_assessment = {
                    "crisis_level": "none",
                    "requires_immediate_intervention": False
                }
            
            # Get conversation history
            conversation_history = [
                {"role": msg.get("role"), "content": msg.get("content")}
                for msg in conversation.get("messages", [])[-10:]  # Last 10 messages
            ]
        else:
            # Database unavailable - return error
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database service unavailable"
            )
        
        # Get user context
        user_context = {
            "current_mood": getattr(current_user, 'current_mood', None),
            "primary_concerns": getattr(current_user, 'primary_concerns', []),
            "risk_level": getattr(current_user, 'risk_level', 'low'),
            "therapy_goals": getattr(current_user, 'therapy_goals', [])
        }
        
        # Generate AI response
        try:
            ai_response = await rag_engine.generate_response(
                user_message=message,
                conversation_history=conversation_history,
                is_crisis=crisis_assessment["requires_immediate_intervention"],
                user_context=user_context
            )
        except Exception as e:
            logger.error(f"AI response generation error: {e}")
            # Fallback response when AI fails
            ai_response = {
                "response": """Thank you for sharing that with me. I'm here to listen and support you. 

**How are you feeling** about what you just shared?

> Remember, this is a safe space where you can express yourself freely.

If you'd like, I can suggest some **coping techniques** to help you feel more centered:
- Deep breathing exercises
- Grounding techniques
- Mindfulness practices

What would be most helpful for you right now?""",
                "therapeutic_elements": {
                    "resources": ["mindfulness-breathing", "grounding-techniques"],
                    "coping_strategies": ["deep-breathing", "positive-self-talk"]
                },
                "contexts_used": ["general-support", "active-listening"]
            }
        
        # Create user message
        from app.models.conversation import Message, MessageRole
        
        # Map mood_state to valid EmotionalTone enum values
        mood_state = mood_analysis.get("mood_state", "neutral").lower()
        emotional_tone_mapping = {
            "positive": EmotionalTone.POSITIVE,
            "negative": EmotionalTone.NEGATIVE,
            "neutral": EmotionalTone.NEUTRAL,
            "anxious": EmotionalTone.ANXIOUS,
            "depressed": EmotionalTone.DEPRESSED,
            "angry": EmotionalTone.ANGRY,
            "fearful": EmotionalTone.FEARFUL,
            "hopeful": EmotionalTone.HOPEFUL,
            "sad": EmotionalTone.DEPRESSED,  # Map sad to depressed
            "happy": EmotionalTone.POSITIVE,  # Map happy to positive
            "excited": EmotionalTone.POSITIVE,  # Map excited to positive
        }
        user_emotional_tone = emotional_tone_mapping.get(mood_state, EmotionalTone.NEUTRAL)
        
        user_message = Message(
            role=MessageRole.USER,
            content=message,
            emotional_tone=user_emotional_tone,
            timestamp=datetime.utcnow()
        )
        
        # Create assistant message
        assistant_message = Message(
            role=MessageRole.ASSISTANT,
            content=ai_response["response"],
            emotional_tone=EmotionalTone.HOPEFUL,  # Use valid enum value instead of "supportive"
            suggested_exercises=ai_response.get("therapeutic_elements", {}).get("resources", []),
            coping_strategies=ai_response.get("therapeutic_elements", {}).get("coping_strategies", []),
            model_used="gemini-2.0-flash-exp"
        )
        
        if database_available:
            # Update conversation
            messages = conversation.get("messages", [])
            messages.append(user_message.dict())
            messages.append(assistant_message.dict())
            
            update_data = {
                "messages": messages,
                "message_count": len(messages),
                "last_activity": datetime.utcnow(),
                "overall_sentiment": mood_analysis["sentiment_scores"]["compound"],
                "dominant_emotion": mood_analysis.get("mood_state"),
                "risk_score": crisis_assessment.get("mood_analysis", {}).get("sentiment_scores", {}).get("compound", 0)
            }
            
            if crisis_assessment["requires_immediate_intervention"]:
                update_data["crisis_detected"] = True
                update_data["status"] = "crisis_flagged"
                
                # Update user's crisis flags
                await users_collection.update_one(
                    {"_id": ObjectId(current_user.id)},
                    {
                        "$push": {"crisis_flags": datetime.utcnow()},
                        "$set": {"risk_level": "high"}
                    }
                )
            
            await conversations_collection.update_one(
                {"id": conversation["id"]},
                {"$set": update_data}
            )
            
            # Update user's mood history
            await users_collection.update_one(
                {"_id": ObjectId(current_user.id)},
                {
                    "$push": {
                        "mood_history": {
                            "timestamp": datetime.utcnow(),
                            "mood_state": mood_analysis.get("mood_state"),
                            "sentiment_score": mood_analysis["sentiment_scores"]["compound"]
                        }
                    },
                    "$set": {
                        "current_mood": mood_analysis.get("mood_state"),
                        "last_activity": datetime.utcnow()
                    },
                    "$inc": {"total_sessions": 1}
                }
            )
        
        response = {
            "conversation_id": conversation.get("id", conversation_id),
            "message": ai_response["response"],
            "mood_analysis": mood_analysis,
            "crisis_intervention": crisis_assessment.get("intervention") if crisis_assessment["requires_immediate_intervention"] else None,
            "therapeutic_elements": ai_response.get("therapeutic_elements", {}),
            "suggested_resources": ai_response.get("contexts_used", [])[:2]
        }
        
        logger.info(f"Message processed for user {current_user.username}, crisis level: {crisis_assessment['crisis_level']}")
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Message processing error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process message"
        )

@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """WebSocket endpoint for real-time chat"""
    await manager.connect(websocket, user_id)
    
    try:
        while True:
            # Receive message
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Process message
            message = sanitize_user_input(message_data.get("message", ""))
            conversation_id = message_data.get("conversation_id")
            
            if not message:
                await manager.send_message(user_id, {
                    "type": "error",
                    "message": "Empty message received"
                })
                continue
            
            # Send typing indicator
            await manager.send_message(user_id, {
                "type": "typing",
                "status": "start"
            })
            
            # Get user
            users_collection = get_users_collection()
            user = await users_collection.find_one({"id": user_id})
            
            if not user:
                await manager.send_message(user_id, {
                    "type": "error",
                    "message": "User not found"
                })
                continue
            
            # Process with mood detection
            mood_analysis = mood_detector.detect_mood(message)
            
            # Check for crisis
            crisis_assessment = crisis_intervention.assess_crisis(
                message,
                {
                    "recent_crisis_flags": len(user.get("crisis_flags", [])),
                    "risk_level": user.get("risk_level", "low")
                }
            )
            
            # Send mood update
            await manager.send_message(user_id, {
                "type": "mood_update",
                "mood": mood_analysis.get("mood_state"),
                "sentiment": mood_analysis["sentiment_scores"]["compound"]
            })
            
            # If crisis detected, send immediate intervention
            if crisis_assessment["requires_immediate_intervention"]:
                await manager.send_message(user_id, {
                    "type": "crisis_alert",
                    "intervention": crisis_assessment.get("intervention"),
                    "resources": crisis_assessment.get("intervention", {}).get("resources", [])
                })
            
            # Generate AI response
            ai_response = await rag_engine.generate_response(
                user_message=message,
                conversation_history=[],
                is_crisis=crisis_assessment["requires_immediate_intervention"],
                user_context={
                    "current_mood": user.get("current_mood"),
                    "primary_concerns": user.get("primary_concerns", []),
                    "risk_level": user.get("risk_level", "low")
                }
            )
            
            # Send response
            await manager.send_message(user_id, {
                "type": "message",
                "content": ai_response["response"],
                "therapeutic_elements": ai_response.get("therapeutic_elements", {}),
                "timestamp": datetime.utcnow().isoformat()
            })
            
            # Stop typing indicator
            await manager.send_message(user_id, {
                "type": "typing",
                "status": "stop"
            })
            
    except WebSocketDisconnect:
        manager.disconnect(user_id)
        logger.info(f"WebSocket disconnected for user: {user_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(user_id)

@router.get("/suggested-prompts")
async def get_suggested_prompts(current_user: User = Depends(get_current_user)):
    """Get suggested conversation prompts based on user profile"""
    try:
        prompts = []
        
        # Based on user's primary concerns
        if "anxiety" in current_user.primary_concerns:
            prompts.extend([
                "I'm feeling anxious about an upcoming event",
                "Can you teach me a breathing exercise?",
                "How can I manage my worry thoughts?"
            ])
        
        if "depression" in current_user.primary_concerns:
            prompts.extend([
                "I'm having trouble finding motivation",
                "Everything feels overwhelming today",
                "Can you help me create a daily routine?"
            ])
        
        if "stress" in current_user.primary_concerns:
            prompts.extend([
                "Work is really stressing me out",
                "I need help managing my time better",
                "Can you suggest some relaxation techniques?"
            ])
        
        # General prompts
        if not prompts:
            prompts = [
                "I'd like to talk about how I'm feeling",
                "Can you help me understand my emotions better?",
                "I want to work on my mental wellness",
                "What coping strategies would you recommend?",
                "I'm looking for ways to improve my mood"
            ]
        
        return {"prompts": prompts[:5]}
        
    except Exception as e:
        logger.error(f"Failed to get suggested prompts: {e}")
        return {"prompts": []}