from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from typing import Optional
import redis.asyncio as redis
from loguru import logger
from app.core.config import settings

class Database:
    client: Optional[AsyncIOMotorClient] = None
    database: Optional[AsyncIOMotorDatabase] = None

db = Database()

class RedisClient:
    client: Optional[redis.Redis] = None

redis_client = RedisClient()

async def connect_to_mongo():
    """Create database connection"""
    try:
        # Configure MongoDB connection with proper SSL settings
        db.client = AsyncIOMotorClient(
            settings.MONGODB_URL,
            tlsAllowInvalidCertificates=True,  # Allow invalid certificates for development
            serverSelectionTimeoutMS=5000,    # Reduce timeout from default 30s
            connectTimeoutMS=5000              # Reduce connection timeout
        )
        db.database = db.client[settings.DATABASE_NAME]
        
        # Test connection
        await db.database.command("ping")
        logger.info(f"Connected to MongoDB database: {settings.DATABASE_NAME}")
        
        # Create indexes
        await create_indexes()
        
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise

async def close_mongo_connection():
    """Close database connection"""
    if db.client:
        db.client.close()
        logger.info("Disconnected from MongoDB")

async def connect_to_redis():
    """Create Redis connection"""
    try:
        redis_client.client = await redis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
            db=settings.REDIS_DB
        )
        
        # Test connection
        await redis_client.client.ping()
        logger.info("Connected to Redis")
        
    except Exception as e:
        logger.error(f"Failed to connect to Redis: {e}")
        # Redis is optional, so we don't raise here

async def close_redis_connection():
    """Close Redis connection"""
    if redis_client.client:
        await redis_client.client.close()
        logger.info("Disconnected from Redis")

async def create_indexes():
    """Create database indexes for better performance"""
    try:
        # User indexes
        users_collection = db.database["users"]
        await users_collection.create_index("email", unique=True)
        await users_collection.create_index("username", unique=True)
        await users_collection.create_index("created_at")
        await users_collection.create_index([("current_mood", 1), ("risk_level", 1)])
        
        # Conversation indexes
        conversations_collection = db.database["conversations"]
        await conversations_collection.create_index("user_id")
        await conversations_collection.create_index("started_at")
        await conversations_collection.create_index([("user_id", 1), ("status", 1)])
        await conversations_collection.create_index([("crisis_detected", 1), ("risk_score", -1)])
        
        # Session indexes
        sessions_collection = db.database["sessions"]
        await sessions_collection.create_index("user_id")
        await sessions_collection.create_index("token", unique=True)
        await sessions_collection.create_index("expires_at")
        
        # Resources indexes
        resources_collection = db.database["resources"]
        await resources_collection.create_index("category")
        await resources_collection.create_index([("category", 1), ("rating", -1)])
        
        # Exercises indexes
        exercises_collection = db.database["exercises"]
        await exercises_collection.create_index("type")
        await exercises_collection.create_index("difficulty")
        await exercises_collection.create_index([("type", 1), ("difficulty", 1)])
        
        logger.info("Database indexes created successfully")
        
    except Exception as e:
        logger.error(f"Failed to create indexes: {e}")

def get_database() -> AsyncIOMotorDatabase:
    """Get database instance"""
    if db.database is None:
        raise RuntimeError("Database is not initialized")
    return db.database

def get_redis() -> redis.Redis:
    """Get Redis client instance"""
    return redis_client.client

# Collection helpers
def get_users_collection():
    """Get users collection"""
    return get_database()["users"]

def get_conversations_collection():
    """Get conversations collection"""
    return get_database()["conversations"]

def get_sessions_collection():
    """Get sessions collection"""
    return get_database()["sessions"]

def get_resources_collection():
    """Get resources collection"""
    return get_database()["resources"]

def get_exercises_collection():
    """Get exercises collection"""
    return get_database()["exercises"]

def get_mood_logs_collection():
    """Get mood logs collection"""
    return get_database()["mood_logs"]