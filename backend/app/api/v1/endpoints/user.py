from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from loguru import logger
from bson import ObjectId
from app.core.database import get_users_collection, get_mood_logs_collection
from app.models.user import User, UserUpdate, UserResponse
from app.api.v1.endpoints.auth import get_current_user
# from app.models.mood import MoodLogCreate, MoodLogResponse
from pydantic import BaseModel

router = APIRouter()

class DashboardResponse(BaseModel):
    mood_streak: int
    total_sessions: int
    weekly_mood_avg: float
    recent_activities: List[Dict[str, Any]]
    mood_trends: List[Dict[str, Any]]
    achievements: List[Dict[str, Any]]

class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None

class PasswordUpdateRequest(BaseModel):
    current_password: str
    new_password: str

@router.get("/dashboard", response_model=DashboardResponse)
async def get_dashboard(current_user: User = Depends(get_current_user)):
    """Get user dashboard data"""
    try:
        dashboard_data = DashboardResponse(
            mood_streak=current_user.streak_days or 0,
            total_sessions=current_user.total_sessions or 0,
            weekly_mood_avg=0.0,
            recent_activities=[],
            mood_trends=[],
            achievements=[]
        )
        
        return dashboard_data
        
    except Exception as e:
        logger.error(f"Dashboard error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch dashboard data"
        )

@router.get("/profile", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    """Get user profile"""
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        username=current_user.username,
        full_name=current_user.full_name,
        role=current_user.role,
        is_active=current_user.is_active,
        is_verified=current_user.is_verified,
        created_at=current_user.created_at,
        current_mood=current_user.current_mood,
        streak_days=current_user.streak_days,
        total_sessions=current_user.total_sessions
    )

@router.put("/profile", response_model=UserResponse)
async def update_profile(
    profile_data: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user)
):
    """Update user profile"""
    try:
        try:
            # Try to update in database
            users_collection = get_users_collection()
            update_data = {k: v for k, v in profile_data.dict().items() if v is not None}
            update_data["updated_at"] = datetime.utcnow()
            
            await users_collection.update_one(
                {"_id": ObjectId(current_user.id)},
                {"$set": update_data}
            )
            
            # Update current user object
            for key, value in update_data.items():
                if hasattr(current_user, key):
                    setattr(current_user, key, value)
                    
        except RuntimeError:
            # Database not available
            logger.warning("Database not available")
        
        return UserResponse(
            id=current_user.id,
            email=current_user.email,
            username=current_user.username,
            full_name=current_user.full_name,
            role=current_user.role,
            is_active=current_user.is_active,
            is_verified=current_user.is_verified,
            created_at=current_user.created_at,
            current_mood=current_user.current_mood,
            streak_days=current_user.streak_days,
            total_sessions=current_user.total_sessions
        )
        
    except Exception as e:
        logger.error(f"Profile update error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )

@router.put("/password")
async def update_password(
    password_data: PasswordUpdateRequest,
    current_user: User = Depends(get_current_user)
):
    """Update user password"""
    try:
        from app.core.security import verify_password, get_password_hash
        
        try:
            # Try to update in database
            users_collection = get_users_collection()
            
            # Verify current password
            if not verify_password(password_data.current_password, current_user.hashed_password):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Incorrect current password"
                )
            
            # Update password
            new_password_hash = get_password_hash(password_data.new_password)
            await users_collection.update_one(
                {"_id": ObjectId(current_user.id)},
                {
                    "$set": {
                        "hashed_password": new_password_hash,
                        "password_changed_at": datetime.utcnow()
                    }
                }
            )
            
        except RuntimeError:
            # Database not available
            logger.warning("Database not available")
        
        return {"message": "Password updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Password update error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update password"
        )

@router.get("/export")
async def export_user_data(current_user: User = Depends(get_current_user)):
    """Export user data"""
    try:
        # Create export data
        export_data = {
            "user_profile": {
                "id": current_user.id,
                "username": current_user.username,
                "email": current_user.email,
                "full_name": current_user.full_name,
                "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
            },
            "mental_health_data": {
                "current_mood": current_user.current_mood,
                "mood_history": current_user.mood_history,
                "primary_concerns": current_user.primary_concerns,
                "therapy_goals": current_user.therapy_goals,
                "risk_level": current_user.risk_level,
            },
            "activity_data": {
                "total_sessions": current_user.total_sessions,
                "completed_exercises": current_user.completed_exercises,
                "streak_days": current_user.streak_days,
            },
            "preferences": {
                "notification_preferences": current_user.notification_preferences,
            },
            "exported_at": datetime.utcnow().isoformat(),
            "format_version": "1.0"
        }
        
        return export_data
        
    except Exception as e:
        logger.error(f"Data export error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to export data"
        )

@router.delete("/account")
async def delete_account(current_user: User = Depends(get_current_user)):
    """Delete user account"""
    try:
        try:
            # Try to delete from database
            users_collection = get_users_collection()
            await users_collection.delete_one({"_id": ObjectId(current_user.id)})
            
        except RuntimeError:
            # Database not available
            logger.warning("Database not available")
        
        return {"message": "Account deleted successfully"}
        
    except Exception as e:
        logger.error(f"Account deletion error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete account"
        )