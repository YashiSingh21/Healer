from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field
from enum import Enum
import uuid

class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"

class ConversationStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    CRISIS_FLAGGED = "crisis_flagged"
    ARCHIVED = "archived"

class EmotionalTone(str, Enum):
    POSITIVE = "positive"
    NEUTRAL = "neutral"
    NEGATIVE = "negative"
    ANXIOUS = "anxious"
    DEPRESSED = "depressed"
    ANGRY = "angry"
    FEARFUL = "fearful"
    HOPEFUL = "hopeful"

class Message(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    role: MessageRole
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    # Emotional Analysis
    emotional_tone: Optional[EmotionalTone] = None
    sentiment_score: Optional[float] = Field(None, ge=-1.0, le=1.0)
    emotion_scores: Optional[Dict[str, float]] = None
    
    # Crisis Detection
    contains_crisis_language: bool = False
    crisis_keywords_detected: List[str] = []
    
    # Therapeutic Elements
    suggested_exercises: List[str] = []
    coping_strategies: List[str] = []
    resources_provided: List[Dict[str, str]] = []
    
    # Metadata
    token_count: Optional[int] = None
    processing_time_ms: Optional[float] = None
    model_used: Optional[str] = None
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class ConversationCreate(BaseModel):
    user_id: str
    initial_message: str
    conversation_type: str = "general"  # general, crisis, guided, assessment
    
class Conversation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    status: ConversationStatus = ConversationStatus.ACTIVE
    
    # Timing
    started_at: datetime = Field(default_factory=datetime.utcnow)
    ended_at: Optional[datetime] = None
    last_activity: datetime = Field(default_factory=datetime.utcnow)
    
    # Messages
    messages: List[Message] = []
    message_count: int = 0
    
    # Conversation Analysis
    overall_sentiment: Optional[float] = None
    dominant_emotion: Optional[EmotionalTone] = None
    mood_progression: List[Dict[str, Any]] = []
    
    # Topics & Concerns
    identified_topics: List[str] = []
    primary_concern: Optional[str] = None
    therapeutic_themes: List[str] = []
    
    # Risk Assessment
    risk_score: float = Field(default=0.0, ge=0.0, le=1.0)
    crisis_detected: bool = False
    intervention_triggered: bool = False
    escalation_needed: bool = False
    
    # Therapeutic Progress
    therapeutic_goals: List[str] = []
    progress_notes: List[str] = []
    breakthrough_moments: List[Dict[str, Any]] = []
    
    # Recommendations
    recommended_exercises: List[str] = []
    suggested_resources: List[Dict[str, str]] = []
    follow_up_topics: List[str] = []
    
    # Summary
    ai_summary: Optional[str] = None
    key_insights: List[str] = []
    action_items: List[str] = []
    
    # Metadata
    conversation_type: str = "general"
    language: str = "en"
    total_tokens_used: int = 0
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class ConversationResponse(BaseModel):
    id: str
    user_id: str
    status: ConversationStatus
    started_at: datetime
    message_count: int
    overall_sentiment: Optional[float]
    dominant_emotion: Optional[EmotionalTone]
    primary_concern: Optional[str]
    risk_score: float
    crisis_detected: bool
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class ConversationSummary(BaseModel):
    conversation_id: str
    user_id: str
    date: datetime
    duration_minutes: int
    message_count: int
    primary_topics: List[str]
    mood_improvement: Optional[float]
    key_insights: List[str]
    recommended_actions: List[str]
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }