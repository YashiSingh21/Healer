from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from loguru import logger
import sys
from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_connection, connect_to_redis, close_redis_connection
from app.api.v1.api import api_router
from app.core.security import rate_limiter
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import time

# Configure logging
logger.remove()
logger.add(sys.stdout, level=settings.LOG_LEVEL)
logger.add(settings.LOG_FILE, rotation="500 MB", level=settings.LOG_LEVEL)

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle"""
    # Startup
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    
    # Connect to databases
    await connect_to_mongo()
    await connect_to_redis()
    
    # Knowledge base ready (using simple RAG)
    logger.info("Simple RAG engine ready")
    
    logger.info("Application startup complete")
    
    yield
    
    # Shutdown
    logger.info("Shutting down application")
    
    # Close database connections
    await close_mongo_connection()
    await close_redis_connection()
    
    logger.info("Application shutdown complete")

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.APP_VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add trusted host middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"]  # Configure based on your domain
)

# Add rate limit error handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Custom middleware for request logging
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all requests"""
    start_time = time.time()
    
    # Log request
    logger.info(f"Request: {request.method} {request.url.path}")
    
    # Process request
    response = await call_next(request)
    
    # Calculate process time
    process_time = time.time() - start_time
    
    # Log response
    logger.info(f"Response: {response.status_code} - Time: {process_time:.3f}s")
    
    # Add custom headers
    response.headers["X-Process-Time"] = str(process_time)
    response.headers["X-API-Version"] = settings.APP_VERSION
    
    return response

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "healthy",
        "message": "Welcome to Healer Platform - Your Mental Health Support System"
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "version": settings.APP_VERSION
    }

# Initialize knowledge base
async def initialize_knowledge_base():
    """Initialize mental health knowledge base"""
    try:
        from app.rag.rag_engine import rag_engine
        
        # Sample mental health knowledge documents
        knowledge_docs = [
            {
                "id": "coping_anxiety_1",
                "content": "Deep breathing exercises can help manage anxiety. Try the 4-7-8 technique: Inhale for 4 counts, hold for 7 counts, exhale for 8 counts. This activates the parasympathetic nervous system and promotes relaxation.",
                "category": "anxiety",
                "type": "coping_strategy",
                "tags": ["breathing", "anxiety", "relaxation"]
            },
            {
                "id": "coping_depression_1",
                "content": "Behavioral activation is effective for depression. Start small: schedule one pleasant activity daily, even if you don't feel like it. Gradual engagement in activities can improve mood over time.",
                "category": "depression",
                "type": "coping_strategy",
                "tags": ["depression", "behavioral_activation", "activities"]
            },
            {
                "id": "mindfulness_1",
                "content": "Mindfulness meditation reduces stress and improves emotional regulation. Practice: Sit comfortably, focus on your breath, observe thoughts without judgment, gently return focus to breathing when mind wanders.",
                "category": "mindfulness",
                "type": "exercise",
                "tags": ["mindfulness", "meditation", "stress"]
            },
            {
                "id": "cbt_thought_1",
                "content": "Cognitive restructuring helps challenge negative thoughts. Ask yourself: Is this thought based on facts or feelings? What evidence supports or contradicts it? What would I tell a friend in this situation?",
                "category": "cbt",
                "type": "technique",
                "tags": ["cbt", "thoughts", "cognitive"]
            },
            {
                "id": "grounding_1",
                "content": "The 5-4-3-2-1 grounding technique helps with panic and dissociation. Identify: 5 things you see, 4 things you can touch, 3 things you hear, 2 things you smell, 1 thing you taste.",
                "category": "grounding",
                "type": "technique",
                "tags": ["grounding", "panic", "anxiety"]
            },
            {
                "id": "sleep_hygiene_1",
                "content": "Good sleep hygiene improves mental health. Maintain consistent sleep schedule, avoid screens 1 hour before bed, keep bedroom cool and dark, limit caffeine after 2pm, create relaxing bedtime routine.",
                "category": "sleep",
                "type": "guidance",
                "tags": ["sleep", "hygiene", "wellness"]
            },
            {
                "id": "crisis_support_1",
                "content": "If you're in crisis, reach out immediately: Call 988 (Suicide & Crisis Lifeline), Text HOME to 741741 (Crisis Text Line), or call 911 for immediate danger. You don't have to face this alone.",
                "category": "crisis",
                "type": "resource",
                "tags": ["crisis", "emergency", "support"]
            },
            {
                "id": "self_compassion_1",
                "content": "Practice self-compassion during difficult times. Treat yourself with the same kindness you'd show a friend. Remember: suffering is part of human experience, you deserve understanding and care.",
                "category": "self_compassion",
                "type": "concept",
                "tags": ["self_compassion", "kindness", "acceptance"]
            },
            {
                "id": "emotion_regulation_1",
                "content": "TIPP technique for intense emotions: Temperature (cold water on face), Intense exercise (jumping jacks), Paced breathing (exhale longer than inhale), Paired muscle relaxation (tense and release).",
                "category": "emotion_regulation",
                "type": "technique",
                "tags": ["emotions", "regulation", "dbt"]
            },
            {
                "id": "social_connection_1",
                "content": "Social connection is vital for mental health. Even small interactions help. Try: sending a text to a friend, joining online communities, volunteering, attending support groups, or scheduling regular check-ins.",
                "category": "social",
                "type": "guidance",
                "tags": ["social", "connection", "support"]
            }
        ]
        
        # Store knowledge in vector database
        await rag_engine.store_knowledge(knowledge_docs)
        logger.info("Mental health knowledge base initialized")
        
    except Exception as e:
        logger.error(f"Failed to initialize knowledge base: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.FASTAPI_HOST,
        port=settings.FASTAPI_PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    )