from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime, timedelta
from loguru import logger
from app.api.v1.endpoints.auth import get_current_user
from app.models.user import User
from app.models.conversation import ConversationResponse, ConversationSummary
from app.core.database import get_conversations_collection

router = APIRouter()

@router.get("/", response_model=List[ConversationResponse])
async def get_conversations(
    limit: int = Query(10, ge=1, le=50),
    skip: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user)
):
    """Get user's conversations"""
    try:
        conversations_collection = get_conversations_collection()
        
        cursor = conversations_collection.find(
            {"user_id": current_user.id}
        ).sort("started_at", -1).skip(skip).limit(limit)
        
        conversations = await cursor.to_list(length=limit)
        
        return [ConversationResponse(**conv) for conv in conversations]
        
    except Exception as e:
        logger.error(f"Failed to get conversations: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve conversations"
        )

@router.get("/{conversation_id}")
async def get_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get specific conversation with full details"""
    try:
        conversations_collection = get_conversations_collection()
        
        conversation = await conversations_collection.find_one({
            "id": conversation_id,
            "user_id": current_user.id
        })
        
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
        
        return conversation
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get conversation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve conversation"
        )

@router.delete("/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a conversation"""
    try:
        conversations_collection = get_conversations_collection()
        
        result = await conversations_collection.delete_one({
            "id": conversation_id,
            "user_id": current_user.id
        })
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
        
        return {"message": "Conversation deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete conversation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete conversation"
        )

@router.get("/summary/recent", response_model=List[ConversationSummary])
async def get_recent_summaries(
    days: int = Query(7, ge=1, le=30),
    current_user: User = Depends(get_current_user)
):
    """Get summaries of recent conversations"""
    try:
        conversations_collection = get_conversations_collection()
        
        since = datetime.utcnow() - timedelta(days=days)
        
        pipeline = [
            {"$match": {
                "user_id": current_user.id,
                "started_at": {"$gte": since}
            }},
            {"$project": {
                "conversation_id": "$id",
                "user_id": 1,
                "date": "$started_at",
                "message_count": 1,
                "primary_topics": "$identified_topics",
                "key_insights": 1,
                "recommended_actions": "$action_items"
            }}
        ]
        
        summaries = await conversations_collection.aggregate(pipeline).to_list(None)
        
        return [ConversationSummary(**summary) for summary in summaries]
        
    except Exception as e:
        logger.error(f"Failed to get summaries: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve summaries"
        )