import google.generativeai as genai
from typing import List, Dict, Any, Optional
from loguru import logger
from app.core.config import settings
import json
import asyncio
from concurrent.futures import ThreadPoolExecutor

class SimpleRAGEngine:
    def __init__(self):
        # Initialize Gemini
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.llm = genai.GenerativeModel(settings.MODEL)
        
        # Thread pool for CPU-bound operations
        self.executor = ThreadPoolExecutor(max_workers=2)
        
        # Simple knowledge base
        self.knowledge_base = {
            "anxiety": "Deep breathing exercises can help manage anxiety. Try the 4-7-8 technique: Inhale for 4 counts, hold for 7 counts, exhale for 8 counts.",
            "depression": "Behavioral activation is effective for depression. Start small: schedule one pleasant activity daily, even if you don't feel like it.",
            "mindfulness": "Mindfulness meditation reduces stress. Sit comfortably, focus on your breath, observe thoughts without judgment.",
            "cbt": "Cognitive restructuring helps challenge negative thoughts. Ask: Is this thought based on facts? What evidence supports it?",
            "grounding": "The 5-4-3-2-1 grounding technique: 5 things you see, 4 things you touch, 3 things you hear, 2 things you smell, 1 thing you taste.",
            "sleep": "Good sleep hygiene: consistent sleep schedule, avoid screens before bed, keep bedroom cool and dark, limit caffeine.",
            "crisis": "If you're in crisis, reach out immediately: Call 988 (Suicide & Crisis Lifeline), Text HOME to 741741, or call 911.",
        }
        
        # System prompts
        self.system_prompts = {
            "therapeutic": """You are a compassionate mental health support assistant. Provide empathetic, evidence-based guidance.
            
            Guidelines:
            1. Always respond with empathy and validation
            2. Use therapeutic communication techniques
            3. Encourage professional help when appropriate
            4. Never diagnose or prescribe medication
            5. Detect crisis situations and provide immediate resources
            6. Maintain a warm, non-judgmental tone
            7. Use active listening and reflection
            8. Provide practical coping strategies
            
            Remember: You are a support tool, not a replacement for professional therapy.""",
            
            "crisis": """CRISIS INTERVENTION MODE
            
            Express immediate concern and care. Provide crisis resources:
            - National Suicide Prevention Lifeline: 988
            - Crisis Text Line: Text HOME to 741741
            - Emergency Services: 911
            
            Stay calm, supportive, and focus on safety."""
        }
    
    async def retrieve_context(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """Simple context retrieval from knowledge base"""
        query_lower = query.lower()
        contexts = []
        
        for topic, content in self.knowledge_base.items():
            if topic in query_lower:
                contexts.append({
                    'content': content,
                    'category': topic,
                    'score': 0.8,  # Simulated relevance score
                    'source': 'built_in_knowledge'
                })
        
        return contexts[:top_k]
    
    async def generate_response(
        self,
        user_message: str,
        conversation_history: List[Dict[str, str]] = None,
        is_crisis: bool = False,
        user_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Generate therapeutic response"""
        try:
            # Retrieve relevant context
            contexts = await self.retrieve_context(user_message)
            
            # Build context string
            context_str = "\n\n".join([
                f"[{ctx['category']}] {ctx['content']}"
                for ctx in contexts
            ])
            
            # Select appropriate system prompt
            system_prompt = self.system_prompts["crisis"] if is_crisis else self.system_prompts["therapeutic"]
            
            # Build conversation context
            history_str = ""
            if conversation_history:
                history_str = "\n".join([
                    f"{msg['role']}: {msg['content']}"
                    for msg in conversation_history[-5:]
                ])
            
            # Build user context
            user_info = ""
            if user_context:
                user_info = f"""
                User Profile:
                - Current Mood: {user_context.get('current_mood', 'unknown')}
                - Primary Concerns: {', '.join(user_context.get('primary_concerns', []))}
                """
            
            # Construct prompt
            prompt = f"""{system_prompt}

            Relevant Knowledge:
            {context_str}
            
            {user_info}
            
            Recent Conversation:
            {history_str}
            
            User: {user_message}
            
            Provide a therapeutic, empathetic response that acknowledges the user's feelings and offers support.
            
            IMPORTANT: Format your response using Markdown for better readability:
            - Use **bold** for important points
            - Use *italics* for emphasis
            - Use bullet points (-) for lists of techniques or suggestions
            - Use numbered lists (1.) for step-by-step instructions
            - Use > blockquotes for important reminders
            - Use ## headings for different sections if the response is long
            
            Make the response visually organized and easy to read."""
            
            # Generate response
            response = self.llm.generate_content(prompt)
            
            return {
                'response': response.text,
                'contexts_used': contexts,
                'therapeutic_elements': {
                    'technique': 'empathetic listening',
                    'coping_strategies': [],
                    'resources': [],
                    'emotional_tone': 'supportive'
                },
                'is_crisis_response': is_crisis
            }
            
        except Exception as e:
            logger.error(f"Failed to generate response: {e}")
            return {
                'response': "I'm here to support you. Could you tell me more about what you're experiencing?",
                'contexts_used': [],
                'therapeutic_elements': {},
                'is_crisis_response': is_crisis,
                'error': str(e)
            }
    
    async def generate_therapeutic_exercise(self, concern: str, difficulty: str = "beginner") -> Dict[str, Any]:
        """Generate personalized therapeutic exercise"""
        try:
            prompt = f"""Create a therapeutic exercise for someone dealing with {concern}.
            Difficulty level: {difficulty}
            
            Include:
            1. Exercise name
            2. Duration (in minutes)
            3. Step-by-step instructions
            4. Expected benefits
            
            Format as a practical, easy-to-follow exercise."""
            
            response = self.llm.generate_content(prompt)
            
            return {
                'concern': concern,
                'difficulty': difficulty,
                'exercise': response.text,
                'generated_at': 'now'
            }
            
        except Exception as e:
            logger.error(f"Failed to generate exercise: {e}")
            return {
                'concern': concern,
                'difficulty': difficulty,
                'exercise': "Try taking 5 deep breaths, counting each inhale and exhale.",
                'generated_at': 'now'
            }

# Singleton instance
simple_rag_engine = SimpleRAGEngine()