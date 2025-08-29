from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime
from loguru import logger
from app.api.v1.endpoints.auth import get_current_user
from app.models.user import User
from app.core.database import get_exercises_collection, get_users_collection
from app.rag.simple_rag import simple_rag_engine as rag_engine

router = APIRouter()

@router.get("/")
async def get_exercises(
    category: Optional[str] = None,
    difficulty: Optional[str] = Query(None, regex="^(beginner|intermediate|advanced)$"),
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user)
):
    """Get therapeutic exercises"""
    try:
        exercises_collection = get_exercises_collection()
        
        query = {}
        if category:
            query["category"] = category
        if difficulty:
            query["difficulty"] = difficulty
        
        # Add personalization based on user concerns
        if current_user.primary_concerns:
            query["$or"] = [
                {"tags": {"$in": current_user.primary_concerns}},
                {"category": {"$in": current_user.primary_concerns}}
            ]
        
        cursor = exercises_collection.find(query).limit(limit)
        exercises = await cursor.to_list(length=limit)
        
        return {"exercises": exercises, "count": len(exercises)}
        
    except Exception as e:
        logger.error(f"Failed to get exercises: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve exercises"
        )

@router.get("/generate")
async def generate_exercise(
    concern: str,
    difficulty: str = Query("beginner", regex="^(beginner|intermediate|advanced)$"),
    current_user: User = Depends(get_current_user)
):
    """Generate personalized therapeutic exercise"""
    try:
        # Generate exercise using AI
        exercise = await rag_engine.generate_therapeutic_exercise(concern, difficulty)
        
        # Save to database for future use
        exercises_collection = get_exercises_collection()
        exercise_doc = {
            "user_id": current_user.id,
            "generated": True,
            "concern": concern,
            "difficulty": difficulty,
            "content": exercise["exercise"],
            "created_at": datetime.utcnow()
        }
        
        await exercises_collection.insert_one(exercise_doc)
        
        return exercise
        
    except Exception as e:
        logger.error(f"Failed to generate exercise: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate exercise"
        )

@router.post("/{exercise_id}/complete")
async def complete_exercise(
    exercise_id: str,
    feedback: Optional[str] = None,
    helpful: bool = True,
    current_user: User = Depends(get_current_user)
):
    """Mark exercise as completed"""
    try:
        users_collection = get_users_collection()
        
        # Add to completed exercises
        await users_collection.update_one(
            {"_id": current_user.id},
            {
                "$push": {
                    "completed_exercises": {
                        "exercise_id": exercise_id,
                        "completed_at": datetime.utcnow(),
                        "feedback": feedback,
                        "helpful": helpful
                    }
                }
            }
        )
        
        return {"message": "Exercise marked as completed"}
        
    except Exception as e:
        logger.error(f"Failed to complete exercise: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to mark exercise as completed"
        )

@router.get("/recommended")
async def get_recommended_exercises(
    current_user: User = Depends(get_current_user)
):
    """Get AI-recommended exercises based on user profile"""
    try:
        exercises = []
        
        # Generate recommendations based on user's concerns
        for concern in current_user.primary_concerns[:3]:  # Top 3 concerns
            exercise = await rag_engine.generate_therapeutic_exercise(
                concern, 
                "beginner"  # Start with beginner exercises
            )
            exercises.append({
                "concern": concern,
                "exercise": exercise["exercise"],
                "difficulty": "beginner"
            })
        
        return {"recommended_exercises": exercises}
        
    except Exception as e:
        logger.error(f"Failed to get recommendations: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get recommendations"
        )