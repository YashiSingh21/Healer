from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Dict, Any
from datetime import datetime, timedelta
from loguru import logger
from bson import ObjectId
from app.api.v1.endpoints.auth import get_current_user
from app.models.user import User, MoodState
from app.core.database import get_users_collection, get_mood_logs_collection
from app.mental_health.mood_detector import mood_detector

router = APIRouter()

from pydantic import BaseModel
from typing import Optional

class MoodLogRequest(BaseModel):
    mood: str
    score: int
    notes: Optional[str] = None
    energy_level: int
    sleep_quality: int
    stress_level: int
    date: str

@router.post("/log")
async def log_mood(
    mood_data: MoodLogRequest,
    current_user: User = Depends(get_current_user)
):
    """Log current mood"""
    try:
        try:
            users_collection = get_users_collection()
            mood_logs_collection = get_mood_logs_collection()
            
            # Create mood log
            mood_log = {
                "user_id": current_user.id,
                "date": mood_data.date,
                "mood": mood_data.mood,
                "score": mood_data.score,
                "notes": mood_data.notes,
                "energy_level": mood_data.energy_level,
                "sleep_quality": mood_data.sleep_quality,
                "stress_level": mood_data.stress_level,
                "timestamp": datetime.utcnow()
            }
            
            # Check if entry already exists for this date
            existing_entry = await mood_logs_collection.find_one({
                "user_id": current_user.id,
                "date": mood_data.date
            })
            
            if existing_entry:
                # Update existing entry
                await mood_logs_collection.update_one(
                    {"user_id": current_user.id, "date": mood_data.date},
                    {"$set": mood_log}
                )
            else:
                # Create new entry
                await mood_logs_collection.insert_one(mood_log)
            
            # Update user's current mood
            await users_collection.update_one(
                {"_id": ObjectId(current_user.id)},
                {"$set": {"current_mood": mood_data.mood}}
            )
            
        except RuntimeError:
            # Database not available
            logger.warning("Database not available")
        
        return {
            "message": "Mood logged successfully", 
            "mood": mood_data.mood,
            "score": mood_data.score,
            "date": mood_data.date
        }
        
    except Exception as e:
        logger.error(f"Mood logging error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to log mood"
        )

@router.get("/entries")
async def get_mood_entries(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    current_user: User = Depends(get_current_user)
):
    """Get mood entries for user"""
    from datetime import date
    try:
        try:
            # Try to get from database
            mood_logs_collection = get_mood_logs_collection()
            
            # Build query
            query = {"user_id": current_user.id}
            if start_date and end_date:
                query["date"] = {"$gte": start_date, "$lte": end_date}
            
            # Get entries
            cursor = mood_logs_collection.find(query).sort("date", 1)
            entries = await cursor.to_list(length=100)
            
            # Convert ObjectId to string
            for entry in entries:
                entry["id"] = str(entry.pop("_id"))
                
            return entries
            
        except RuntimeError:
            # Database not available
            logger.warning("Database not available")
            return []
            
    except Exception as e:
        logger.error(f"Mood entries retrieval error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve mood entries"
        )

@router.get("/history")
async def get_mood_history(
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_current_user)
):
    """Get mood history"""
    try:
        try:
            mood_logs_collection = get_mood_logs_collection()
            
            since = datetime.utcnow() - timedelta(days=days)
            
            cursor = mood_logs_collection.find({
                "user_id": current_user.id,
                "timestamp": {"$gte": since}
            }).sort("timestamp", -1)
            
            mood_logs = await cursor.to_list(length=None)
            
            return {
                "mood_logs": mood_logs,
                "period_days": days,
                "total_logs": len(mood_logs)
            }
            
        except RuntimeError:
            # Database not available
            logger.warning("Database not available")
            return {
                "mood_logs": [],
                "period_days": days,
                "total_logs": 0
            }
        
    except Exception as e:
        logger.error(f"Failed to get mood history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve mood history"
        )

@router.get("/analysis")
async def get_mood_analysis(
    current_user: User = Depends(get_current_user)
):
    """Get mood analysis and trends"""
    try:
        # Get user's mood history
        users_collection = get_users_collection()
        user = await users_collection.find_one({"_id": ObjectId(current_user.id)})
        
        if not user or not user.get("mood_history"):
            return {
                "trend": "insufficient_data",
                "message": "Not enough mood data for analysis"
            }
        
        # Analyze mood progression
        analysis = mood_detector.analyze_mood_progression(user["mood_history"])
        
        return analysis
        
    except Exception as e:
        logger.error(f"Mood analysis error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to analyze mood"
        )

@router.post("/check-in")
async def daily_check_in(
    mood: MoodState,
    energy_level: int = Query(..., ge=1, le=10),
    sleep_quality: int = Query(..., ge=1, le=10),
    stress_level: int = Query(..., ge=1, le=10),
    notes: str = "",
    current_user: User = Depends(get_current_user)
):
    """Daily mental health check-in"""
    try:
        mood_logs_collection = get_mood_logs_collection()
        users_collection = get_users_collection()
        
        # Get current user data
        user = await users_collection.find_one({"_id": ObjectId(current_user.id)})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Create comprehensive check-in
        check_in = {
            "user_id": current_user.id,
            "type": "daily_check_in",
            "mood": mood,
            "energy_level": energy_level,
            "sleep_quality": sleep_quality,
            "stress_level": stress_level,
            "notes": notes,
            "timestamp": datetime.utcnow()
        }
        
        # Analyze if notes provided
        if notes:
            analysis = mood_detector.detect_mood(notes)
            check_in["sentiment_analysis"] = analysis
        
        # Save check-in
        await mood_logs_collection.insert_one(check_in)
        
        # Update user streak
        last_checkin = user.get("last_checkin_date")
        today = datetime.utcnow().date()
        
        if last_checkin:
            last_date = last_checkin.date()
            if (today - last_date).days == 1:
                # Consecutive day - increase streak
                await users_collection.update_one(
                    {"_id": ObjectId(current_user.id)},
                    {"$inc": {"streak_days": 1}}
                )
            elif (today - last_date).days > 1:
                # Streak broken - reset to 1
                await users_collection.update_one(
                    {"_id": ObjectId(current_user.id)},
                    {"$set": {"streak_days": 1}}
                )
        else:
            # First check-in
            await users_collection.update_one(
                {"_id": ObjectId(current_user.id)},
                {"$set": {"streak_days": 1}}
            )
        
        # Update last check-in date
        await users_collection.update_one(
            {"_id": ObjectId(current_user.id)},
            {"$set": {"last_checkin_date": datetime.utcnow()}}
        )
        
        return {
            "message": "Check-in completed successfully",
            "streak_days": user.get("streak_days", 1) + 1
        }
        
    except Exception as e:
        logger.error(f"Check-in error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to complete check-in"
        )