from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime
from loguru import logger
from app.api.v1.endpoints.auth import get_current_user
from app.models.user import User, UserResponse, UserUpdate
from app.core.database import get_users_collection

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    return UserResponse(**current_user.dict())

@router.put("/me", response_model=UserResponse)
async def update_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update user profile"""
    try:
        users_collection = get_users_collection()
        
        update_data = user_update.dict(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow()
        
        await users_collection.update_one(
            {"_id": current_user.id},
            {"$set": update_data}
        )
        
        updated_user = await users_collection.find_one({"_id": current_user.id})
        return UserResponse(**updated_user)
        
    except Exception as e:
        logger.error(f"Profile update error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )

@router.post("/concerns")
async def update_primary_concerns(
    concerns: List[str],
    current_user: User = Depends(get_current_user)
):
    """Update user's primary mental health concerns"""
    try:
        users_collection = get_users_collection()
        
        await users_collection.update_one(
            {"_id": current_user.id},
            {
                "$set": {
                    "primary_concerns": concerns,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        return {"message": "Concerns updated successfully", "concerns": concerns}
        
    except Exception as e:
        logger.error(f"Concerns update error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update concerns"
        )

@router.post("/goals")
async def update_therapy_goals(
    goals: List[str],
    current_user: User = Depends(get_current_user)
):
    """Update user's therapy goals"""
    try:
        users_collection = get_users_collection()
        
        await users_collection.update_one(
            {"_id": current_user.id},
            {
                "$set": {
                    "therapy_goals": goals,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        return {"message": "Goals updated successfully", "goals": goals}
        
    except Exception as e:
        logger.error(f"Goals update error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update goals"
        )