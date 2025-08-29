from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, validator
from enum import Enum
import uuid

class UserRole(str, Enum):
    USER = "user"
    THERAPIST = "therapist"
    ADMIN = "admin"

class MoodState(str, Enum):
    VERY_POSITIVE = "very_positive"
    POSITIVE = "positive"
    NEUTRAL = "neutral"
    NEGATIVE = "negative"
    VERY_NEGATIVE = "very_negative"
    CRISIS = "crisis"

class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    age: Optional[int] = Field(None, ge=13, le=120)
    gender: Optional[str] = None
    timezone: Optional[str] = "UTC"
    language: str = "en"
    
class UserCreate(UserBase):
    password: str
    terms_accepted: bool = Field(..., description="User must accept terms")
    
    @validator("password")
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not any(char.isdigit() for char in v):
            raise ValueError("Password must contain at least one digit")
        if not any(char.isupper() for char in v):
            raise ValueError("Password must contain at least one uppercase letter")
        return v

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    age: Optional[int] = Field(None, ge=13, le=120)
    gender: Optional[str] = None
    timezone: Optional[str] = None
    language: Optional[str] = None
    notification_preferences: Optional[Dict[str, bool]] = None

class UserInDB(UserBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    hashed_password: str
    role: UserRole = UserRole.USER
    is_active: bool = True
    is_verified: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None
    
    # Mental Health Profile
    primary_concerns: List[str] = []
    therapy_goals: List[str] = []
    current_mood: Optional[MoodState] = None
    mood_history: List[Dict[str, Any]] = []
    
    # Risk Assessment
    risk_level: str = "low"  # low, medium, high, critical
    crisis_flags: List[str] = []
    last_crisis_check: Optional[datetime] = None
    
    # Preferences
    notification_preferences: Dict[str, bool] = Field(default_factory=lambda: {
        "daily_checkin": True,
        "mood_reminder": True,
        "exercise_reminder": False,
        "crisis_alert": True
    })
    
    # Progress Tracking
    total_sessions: int = 0
    completed_exercises: List[str] = []
    streak_days: int = 0
    last_activity: Optional[datetime] = None
    
    # Emergency Contact
    emergency_contact: Optional[Dict[str, str]] = None
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class User(UserInDB):
    pass

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    username: str
    full_name: Optional[str]
    role: UserRole
    is_active: bool
    is_verified: bool
    created_at: datetime
    current_mood: Optional[MoodState]
    streak_days: int
    total_sessions: int
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class TokenData(BaseModel):
    sub: str
    exp: datetime
    scopes: List[str] = []

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class UserLogin(BaseModel):
    username: str
    password: str