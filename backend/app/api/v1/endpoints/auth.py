from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import Optional
from datetime import datetime, timedelta
from loguru import logger
from bson import ObjectId
from app.core.security import (
    create_access_token,
    create_refresh_token,
    verify_password,
    get_password_hash,
    decode_token,
    generate_verification_token
)
from app.core.database import get_users_collection, get_sessions_collection
from app.models.user import UserCreate, UserLogin, Token, User, UserResponse
from app.core.config import settings

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    """Get current authenticated user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decode_token(token)
    if payload is None:
        raise credentials_exception
    
    username: str = payload.get("sub")
    if username is None:
        raise credentials_exception
    
    try:
        # Try to get user from database
        users_collection = get_users_collection()
        user = await users_collection.find_one({"username": username})
        
        if user is None:
            raise credentials_exception
        
        # Convert MongoDB ObjectId to string for the id field
        user["id"] = str(user["_id"])
        return User(**user)
        
    except (RuntimeError, Exception):
        # Database not available
        raise credentials_exception

@router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate):
    """Register new user"""
    try:
        # Try to get database connection
        try:
            users_collection = get_users_collection()
            
            # Check if user exists
            existing_user = await users_collection.find_one({
                "$or": [
                    {"email": user_data.email},
                    {"username": user_data.username}
                ]
            })
            
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="User with this email or username already exists"
                )
            
            # Create new user
            user_dict = user_data.dict()
            user_dict["hashed_password"] = get_password_hash(user_dict.pop("password"))
            user_dict["created_at"] = datetime.utcnow()
            user_dict["updated_at"] = datetime.utcnow()
            user_dict["is_active"] = True
            user_dict["is_verified"] = False
            user_dict["role"] = "user"
            user_dict["current_mood"] = None
            user_dict["risk_level"] = "low"
            user_dict["total_sessions"] = 0
            user_dict["streak_days"] = 0
            user_dict["mood_history"] = []
            user_dict["primary_concerns"] = []
            user_dict["therapy_goals"] = []
            user_dict["completed_exercises"] = []
            user_dict["crisis_flags"] = []
            
            # Insert user
            result = await users_collection.insert_one(user_dict)
            user_dict["id"] = str(result.inserted_id)
            # Remove _id field since we're using id
            user_dict.pop("_id", None)
            
            logger.info(f"New user registered: {user_data.username}")
            
        except RuntimeError as db_error:
            # Database not available
            logger.warning(f"Database not available: {db_error}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database service unavailable"
            )
        
        return UserResponse(**user_dict)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Login user"""
    try:
        # Try to get database connection
        try:
            users_collection = get_users_collection()
            
            # Find user
            user = await users_collection.find_one({"username": form_data.username})
            
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Incorrect username or password",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            # Verify password
            if not verify_password(form_data.password, user["hashed_password"]):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Incorrect username or password",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            # Check if user is active
            if not user.get("is_active", True):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="User account is disabled"
                )
            
            # Create tokens
            access_token = create_access_token(
                data={"sub": user["username"], "id": str(user["_id"])}
            )
            refresh_token = create_refresh_token(
                data={"sub": user["username"], "id": str(user["_id"])}
            )
            
            # Update last login
            await users_collection.update_one(
                {"_id": user["_id"]},
                {"$set": {"last_login": datetime.utcnow()}}
            )
            
            # Create session
            sessions_collection = get_sessions_collection()
            await sessions_collection.insert_one({
                "user_id": str(user["_id"]),
                "token": access_token,
                "refresh_token": refresh_token,
                "created_at": datetime.utcnow(),
                "expires_at": datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
                "ip_address": None,  # Client info not available in OAuth2PasswordRequestForm
                "user_agent": None
            })
            
            logger.info(f"User logged in: {form_data.username}")
            
        except RuntimeError as db_error:
            # Database not available
            logger.warning(f"Database not available: {db_error}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database service unavailable"
            )
        
        return Token(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )

@router.post("/refresh", response_model=Token)
async def refresh_token(refresh_token: str = Body(...)):
    """Refresh access token"""
    try:
        payload = decode_token(refresh_token)
        
        if not payload or payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        username = payload.get("sub")
        user_id = payload.get("id")
        
        # Create new tokens
        new_access_token = create_access_token(
            data={"sub": username, "id": user_id}
        )
        new_refresh_token = create_refresh_token(
            data={"sub": username, "id": user_id}
        )
        
        return Token(
            access_token=new_access_token,
            refresh_token=new_refresh_token,
            token_type="bearer"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token refresh error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token refresh failed"
        )

@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """Logout user"""
    try:
        sessions_collection = get_sessions_collection()
        
        # Invalidate all user sessions
        await sessions_collection.update_many(
            {"user_id": current_user.id},
            {"$set": {"invalidated": True, "invalidated_at": datetime.utcnow()}}
        )
        
        logger.info(f"User logged out: {current_user.username}")
        
        return {"message": "Successfully logged out"}
        
    except Exception as e:
        logger.error(f"Logout error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Logout failed"
        )

@router.post("/verify-email")
async def verify_email(token: str = Body(...), current_user: User = Depends(get_current_user)):
    """Verify user email"""
    try:
        users_collection = get_users_collection()
        
        # Update user verification status
        await users_collection.update_one(
            {"_id": ObjectId(current_user.id)},
            {"$set": {"is_verified": True, "verified_at": datetime.utcnow()}}
        )
        
        logger.info(f"Email verified for user: {current_user.username}")
        
        return {"message": "Email verified successfully"}
        
    except Exception as e:
        logger.error(f"Email verification error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Email verification failed"
        )

@router.post("/change-password")
async def change_password(
    old_password: str = Body(...),
    new_password: str = Body(...),
    current_user: User = Depends(get_current_user)
):
    """Change user password"""
    try:
        users_collection = get_users_collection()
        
        # Verify old password
        if not verify_password(old_password, current_user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect password"
            )
        
        # Hash new password
        new_password_hash = get_password_hash(new_password)
        
        # Update password
        await users_collection.update_one(
            {"_id": ObjectId(current_user.id)},
            {
                "$set": {
                    "hashed_password": new_password_hash,
                    "password_changed_at": datetime.utcnow()
                }
            }
        )
        
        logger.info(f"Password changed for user: {current_user.username}")
        
        return {"message": "Password changed successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Password change error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password change failed"
        )