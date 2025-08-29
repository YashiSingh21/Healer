from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, user, chat, conversations, mood, exercises, resources

api_router = APIRouter()

# Include routers
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(user.router, prefix="/user", tags=["user"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(conversations.router, prefix="/conversations", tags=["conversations"])
api_router.include_router(mood.router, prefix="/mood", tags=["mood"])
api_router.include_router(exercises.router, prefix="/exercises", tags=["exercises"])
api_router.include_router(resources.router, prefix="/resources", tags=["resources"])