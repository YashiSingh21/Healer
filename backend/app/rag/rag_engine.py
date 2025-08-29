import google.generativeai as genai
from pinecone import Pinecone, ServerlessSpec
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any, Optional
import numpy as np
from loguru import logger
import asyncio
from concurrent.futures import ThreadPoolExecutor
from app.core.config import settings
import json

class RAGEngine:
    def __init__(self):
        # Initialize Gemini
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.llm = genai.GenerativeModel(settings.MODEL)
        
        # Initialize Pinecone
        self.pc = Pinecone(api_key=settings.PINECONE_API_KEY)
        
        # Initialize or get index
        self._initialize_pinecone_index()
        
        # Initialize embedding model
        self.embedder = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Thread pool for CPU-bound operations
        self.executor = ThreadPoolExecutor(max_workers=4)
        
        # System prompts
        self.system_prompts = {
            "therapeutic": """You are a compassionate and professional mental health support assistant. 
            Your role is to provide empathetic, evidence-based guidance while maintaining appropriate boundaries.
            
            Guidelines:
            1. Always respond with empathy and validation
            2. Use therapeutic communication techniques
            3. Encourage professional help when appropriate
            4. Never diagnose or prescribe medication
            5. Detect crisis situations and provide immediate resources
            6. Maintain a warm, non-judgmental tone
            7. Use active listening and reflection
            8. Provide practical coping strategies
            9. Respect user privacy and confidentiality
            10. Encourage self-care and positive behaviors
            
            Remember: You are a support tool, not a replacement for professional therapy.""",
            
            "crisis": """CRISIS INTERVENTION MODE ACTIVATED
            
            You must:
            1. Express immediate concern and care
            2. Provide crisis hotline information (988 in US)
            3. Encourage immediate professional help
            4. Stay calm and supportive
            5. Avoid making the situation worse
            6. Use de-escalation techniques
            7. Focus on safety
            
            Crisis Resources:
            - National Suicide Prevention Lifeline: 988
            - Crisis Text Line: Text HOME to 741741
            - Emergency Services: 911
            
            Your response should be immediate, caring, and action-oriented."""
        }
    
    def _initialize_pinecone_index(self):
        """Initialize Pinecone index"""
        try:
            # Check if index exists
            existing_indexes = self.pc.list_indexes()
            
            if settings.PINECONE_INDEX not in [idx.name for idx in existing_indexes]:
                # Create index
                self.pc.create_index(
                    name=settings.PINECONE_INDEX,
                    dimension=384,  # all-MiniLM-L6-v2 dimension
                    metric='cosine',
                    spec=ServerlessSpec(
                        cloud='aws',
                        region='us-east-1'
                    )
                )
                logger.info(f"Created Pinecone index: {settings.PINECONE_INDEX}")
            
            self.index = self.pc.Index(settings.PINECONE_INDEX)
            
        except Exception as e:
            logger.error(f"Failed to initialize Pinecone: {e}")
            raise
    
    async def embed_text(self, text: str) -> np.ndarray:
        """Generate embeddings for text"""
        loop = asyncio.get_event_loop()
        embedding = await loop.run_in_executor(
            self.executor,
            self.embedder.encode,
            text
        )
        return embedding
    
    async def store_knowledge(self, documents: List[Dict[str, Any]]):
        """Store mental health knowledge in vector database"""
        try:
            vectors = []
            
            for doc in documents:
                # Generate embedding
                embedding = await self.embed_text(doc['content'])
                
                # Prepare vector
                vector = {
                    'id': doc.get('id', f"doc_{len(vectors)}"),
                    'values': embedding.tolist(),
                    'metadata': {
                        'content': doc['content'],
                        'category': doc.get('category', 'general'),
                        'source': doc.get('source', 'unknown'),
                        'type': doc.get('type', 'knowledge'),
                        'tags': doc.get('tags', [])
                    }
                }
                vectors.append(vector)
            
            # Batch upsert to Pinecone
            batch_size = 100
            for i in range(0, len(vectors), batch_size):
                batch = vectors[i:i + batch_size]
                self.index.upsert(vectors=batch)
            
            logger.info(f"Stored {len(vectors)} documents in vector database")
            
        except Exception as e:
            logger.error(f"Failed to store knowledge: {e}")
            raise
    
    async def retrieve_context(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Retrieve relevant context from vector database"""
        try:
            # Generate query embedding
            query_embedding = await self.embed_text(query)
            
            # Search in Pinecone
            results = self.index.query(
                vector=query_embedding.tolist(),
                top_k=top_k,
                include_metadata=True
            )
            
            # Extract relevant documents
            contexts = []
            for match in results['matches']:
                contexts.append({
                    'content': match['metadata'].get('content', ''),
                    'category': match['metadata'].get('category', ''),
                    'score': match['score'],
                    'source': match['metadata'].get('source', '')
                })
            
            return contexts
            
        except Exception as e:
            logger.error(f"Failed to retrieve context: {e}")
            return []
    
    async def generate_response(
        self,
        user_message: str,
        conversation_history: List[Dict[str, str]] = None,
        is_crisis: bool = False,
        user_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Generate therapeutic response using RAG"""
        try:
            # Retrieve relevant context
            contexts = await self.retrieve_context(user_message)
            
            # Build context string
            context_str = "\n\n".join([
                f"[{ctx['category']}] {ctx['content']}"
                for ctx in contexts[:3]
            ])
            
            # Select appropriate system prompt
            system_prompt = self.system_prompts["crisis"] if is_crisis else self.system_prompts["therapeutic"]
            
            # Build conversation context
            history_str = ""
            if conversation_history:
                history_str = "\n".join([
                    f"{msg['role']}: {msg['content']}"
                    for msg in conversation_history[-5:]  # Last 5 messages
                ])
            
            # Build user context
            user_info = ""
            if user_context:
                user_info = f"""
                User Profile:
                - Current Mood: {user_context.get('current_mood', 'unknown')}
                - Primary Concerns: {', '.join(user_context.get('primary_concerns', []))}
                - Risk Level: {user_context.get('risk_level', 'unknown')}
                """
            
            # Construct prompt
            prompt = f"""{system_prompt}

            Relevant Knowledge:
            {context_str}
            
            {user_info}
            
            Conversation History:
            {history_str}
            
            User: {user_message}
            
            Please provide a therapeutic, empathetic response that:
            1. Acknowledges the user's feelings
            2. Provides relevant support and guidance
            3. Suggests practical coping strategies if appropriate
            4. Encourages professional help if needed
            
            Response:"""
            
            # Generate response
            response = self.llm.generate_content(prompt)
            
            # Extract therapeutic elements
            therapeutic_elements = await self._extract_therapeutic_elements(response.text)
            
            return {
                'response': response.text,
                'contexts_used': contexts,
                'therapeutic_elements': therapeutic_elements,
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
    
    async def _extract_therapeutic_elements(self, response: str) -> Dict[str, Any]:
        """Extract therapeutic elements from response"""
        try:
            prompt = f"""Analyze this therapeutic response and extract key elements:
            
            Response: {response}
            
            Extract:
            1. Main therapeutic technique used (e.g., validation, reframing, CBT, mindfulness)
            2. Coping strategies mentioned
            3. Resources or exercises suggested
            4. Emotional tone (supportive, encouraging, calming, etc.)
            5. Call-to-action (what the user should do next)
            
            Format as JSON:
            {{
                "technique": "",
                "coping_strategies": [],
                "resources": [],
                "emotional_tone": "",
                "call_to_action": ""
            }}"""
            
            result = self.llm.generate_content(prompt)
            
            # Parse JSON from response
            try:
                elements = json.loads(result.text)
            except:
                elements = {
                    "technique": "empathetic listening",
                    "coping_strategies": [],
                    "resources": [],
                    "emotional_tone": "supportive",
                    "call_to_action": "continue sharing"
                }
            
            return elements
            
        except Exception as e:
            logger.error(f"Failed to extract therapeutic elements: {e}")
            return {}
    
    async def analyze_conversation_mood(self, messages: List[str]) -> Dict[str, Any]:
        """Analyze mood progression in conversation"""
        try:
            messages_text = "\n".join([f"Message {i+1}: {msg}" for i, msg in enumerate(messages)])
            
            prompt = f"""Analyze the emotional progression in this conversation:
            
            {messages_text}
            
            Provide:
            1. Overall mood trajectory (improving, declining, stable)
            2. Dominant emotions detected
            3. Risk indicators (0-10 scale)
            4. Therapeutic progress indicators
            5. Recommended interventions
            
            Format as JSON:
            {{
                "mood_trajectory": "",
                "dominant_emotions": [],
                "risk_score": 0,
                "progress_indicators": [],
                "recommended_interventions": []
            }}"""
            
            response = self.llm.generate_content(prompt)
            
            try:
                analysis = json.loads(response.text)
            except:
                analysis = {
                    "mood_trajectory": "unknown",
                    "dominant_emotions": [],
                    "risk_score": 0,
                    "progress_indicators": [],
                    "recommended_interventions": []
                }
            
            return analysis
            
        except Exception as e:
            logger.error(f"Failed to analyze mood: {e}")
            return {}
    
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
            5. When to practice this
            6. Variations or modifications
            
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
            return {}

# Singleton instance
rag_engine = RAGEngine()