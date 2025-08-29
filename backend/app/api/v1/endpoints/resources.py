from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime
from loguru import logger
from app.api.v1.endpoints.auth import get_current_user
from app.models.user import User
from app.core.database import get_resources_collection

router = APIRouter()

@router.get("/")
async def get_resources(
    category: Optional[str] = None,
    resource_type: Optional[str] = None,
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user)
):
    """Get mental health resources"""
    try:
        resources_collection = get_resources_collection()
        
        # Initialize default resources if empty
        count = await resources_collection.count_documents({})
        if count == 0:
            await _initialize_resources(resources_collection)
        
        query = {}
        if category:
            query["category"] = category
        if resource_type:
            query["type"] = resource_type
        
        cursor = resources_collection.find(query).limit(limit)
        resources = await cursor.to_list(length=limit)
        
        return {"resources": resources, "count": len(resources)}
        
    except Exception as e:
        logger.error(f"Failed to get resources: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve resources"
        )

@router.get("/crisis")
async def get_crisis_resources(
    country: str = Query("us"),
    current_user: User = Depends(get_current_user)
):
    """Get crisis intervention resources"""
    try:
        crisis_resources = {
            "us": {
                "hotlines": [
                    {
                        "name": "988 Suicide & Crisis Lifeline",
                        "number": "988",
                        "available": "24/7",
                        "description": "Free, confidential crisis support"
                    },
                    {
                        "name": "Crisis Text Line",
                        "number": "Text HOME to 741741",
                        "available": "24/7",
                        "description": "Text-based crisis support"
                    },
                    {
                        "name": "NAMI Helpline",
                        "number": "1-800-950-6264",
                        "available": "Mon-Fri, 10am-10pm ET",
                        "description": "Information and referral services"
                    },
                    {
                        "name": "SAMHSA National Helpline",
                        "number": "1-800-662-4357",
                        "available": "24/7",
                        "description": "Treatment referral and information"
                    }
                ],
                "websites": [
                    {
                        "name": "NIMH - National Institute of Mental Health",
                        "url": "https://www.nimh.nih.gov",
                        "description": "Research and information on mental health"
                    },
                    {
                        "name": "MentalHealth.gov",
                        "url": "https://www.mentalhealth.gov",
                        "description": "U.S. government mental health information"
                    }
                ],
                "emergency": "911"
            }
        }
        
        return crisis_resources.get(country, crisis_resources["us"])
        
    except Exception as e:
        logger.error(f"Failed to get crisis resources: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve crisis resources"
        )

@router.post("/save")
async def save_resource(
    resource_id: str,
    current_user: User = Depends(get_current_user)
):
    """Save resource to user's collection"""
    try:
        users_collection = get_users_collection()
        
        await users_collection.update_one(
            {"_id": current_user.id},
            {
                "$addToSet": {
                    "saved_resources": {
                        "resource_id": resource_id,
                        "saved_at": datetime.utcnow()
                    }
                }
            }
        )
        
        return {"message": "Resource saved successfully"}
        
    except Exception as e:
        logger.error(f"Failed to save resource: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save resource"
        )

async def _initialize_resources(collection):
    """Initialize default resources"""
    default_resources = [
        {
            "title": "Understanding Depression",
            "category": "depression",
            "type": "article",
            "content": "Depression is more than just feeling sad...",
            "url": "https://www.nimh.nih.gov/health/topics/depression",
            "rating": 4.8
        },
        {
            "title": "Anxiety Management Techniques",
            "category": "anxiety",
            "type": "guide",
            "content": "Learn effective strategies to manage anxiety...",
            "rating": 4.7
        },
        {
            "title": "Mindfulness for Beginners",
            "category": "mindfulness",
            "type": "course",
            "content": "Introduction to mindfulness meditation...",
            "rating": 4.9
        },
        {
            "title": "Sleep Hygiene Guide",
            "category": "wellness",
            "type": "guide",
            "content": "Improve your sleep quality with these tips...",
            "rating": 4.6
        },
        {
            "title": "Stress Management Workbook",
            "category": "stress",
            "type": "workbook",
            "content": "Interactive exercises for stress reduction...",
            "rating": 4.5
        }
    ]
    
    await collection.insert_many(default_resources)