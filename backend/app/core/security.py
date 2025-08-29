from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from cryptography.fernet import Fernet
import secrets
import hashlib
from loguru import logger
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Initialize encryption
fernet = Fernet(settings.ENCRYPTION_KEY.encode())

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    
    return encoded_jwt

def create_refresh_token(data: Dict[str, Any]) -> str:
    """Create JWT refresh token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    
    return encoded_jwt

def decode_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and validate JWT token"""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError as e:
        logger.error(f"JWT decode error: {e}")
        return None

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash password"""
    return pwd_context.hash(password)

def encrypt_sensitive_data(data: str) -> str:
    """Encrypt sensitive data"""
    if not data:
        return data
    
    try:
        encrypted = fernet.encrypt(data.encode())
        return encrypted.decode()
    except Exception as e:
        logger.error(f"Encryption error: {e}")
        raise

def decrypt_sensitive_data(encrypted_data: str) -> str:
    """Decrypt sensitive data"""
    if not encrypted_data:
        return encrypted_data
    
    try:
        decrypted = fernet.decrypt(encrypted_data.encode())
        return decrypted.decode()
    except Exception as e:
        logger.error(f"Decryption error: {e}")
        raise

def generate_verification_token() -> str:
    """Generate email verification token"""
    return secrets.token_urlsafe(32)

def generate_password_reset_token() -> str:
    """Generate password reset token"""
    return secrets.token_urlsafe(32)

def generate_session_id() -> str:
    """Generate unique session ID"""
    return secrets.token_hex(32)

def hash_api_key(api_key: str) -> str:
    """Hash API key for storage"""
    return hashlib.sha256(api_key.encode()).hexdigest()

def generate_api_key() -> str:
    """Generate new API key"""
    return f"hk_{secrets.token_urlsafe(32)}"

def sanitize_user_input(text: str) -> str:
    """Sanitize user input to prevent injection attacks"""
    if not text:
        return text
    
    # Remove potential dangerous characters
    dangerous_chars = ["<", ">", "&", '"', "'", "/", "\\", "\x00"]
    
    sanitized = text
    for char in dangerous_chars:
        sanitized = sanitized.replace(char, "")
    
    # Limit length
    max_length = 10000
    if len(sanitized) > max_length:
        sanitized = sanitized[:max_length]
    
    return sanitized.strip()

def validate_session_token(token: str) -> Optional[Dict[str, Any]]:
    """Validate session token"""
    payload = decode_token(token)
    
    if not payload:
        return None
    
    if payload.get("type") != "access":
        return None
    
    # Check expiration
    exp = payload.get("exp")
    if exp and datetime.fromtimestamp(exp) < datetime.utcnow():
        return None
    
    return payload

def mask_sensitive_info(text: str, mask_emails: bool = True, mask_phones: bool = True) -> str:
    """Mask sensitive information in text"""
    import re
    
    masked = text
    
    if mask_emails:
        # Mask email addresses
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        masked = re.sub(email_pattern, '[EMAIL_MASKED]', masked)
    
    if mask_phones:
        # Mask phone numbers (various formats)
        phone_patterns = [
            r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b',  # 123-456-7890
            r'\b\(\d{3}\)\s?\d{3}[-.]?\d{4}\b',  # (123) 456-7890
            r'\b\+?1?\s?\d{10}\b',  # +1 1234567890
        ]
        
        for pattern in phone_patterns:
            masked = re.sub(pattern, '[PHONE_MASKED]', masked)
    
    # Mask SSN-like patterns
    ssn_pattern = r'\b\d{3}-\d{2}-\d{4}\b'
    masked = re.sub(ssn_pattern, '[SSN_MASKED]', masked)
    
    # Mask credit card-like patterns
    cc_pattern = r'\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b'
    masked = re.sub(cc_pattern, '[CC_MASKED]', masked)
    
    return masked

class RateLimiter:
    """Simple rate limiter implementation"""
    
    def __init__(self):
        self.requests = {}
    
    def is_allowed(self, key: str, max_requests: int, window_seconds: int) -> bool:
        """Check if request is allowed based on rate limit"""
        now = datetime.utcnow()
        
        if key not in self.requests:
            self.requests[key] = []
        
        # Remove old requests outside the window
        cutoff = now - timedelta(seconds=window_seconds)
        self.requests[key] = [req for req in self.requests[key] if req > cutoff]
        
        # Check if limit exceeded
        if len(self.requests[key]) >= max_requests:
            return False
        
        # Add current request
        self.requests[key].append(now)
        return True
    
    def cleanup(self):
        """Clean up old entries"""
        cutoff = datetime.utcnow() - timedelta(hours=1)
        
        for key in list(self.requests.keys()):
            self.requests[key] = [req for req in self.requests[key] if req > cutoff]
            
            if not self.requests[key]:
                del self.requests[key]

rate_limiter = RateLimiter()