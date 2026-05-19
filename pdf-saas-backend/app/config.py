from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # API
    API_TITLE: str = "PDF SaaS API"
    API_VERSION: str = "0.1.0"
    DEBUG: bool = False
    
    # Database
    DATABASE_URL: str = "postgresql://pdfsaas:dev_password_123@db:5432/pdf_saas"
    
    # JWT
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Stripe
    STRIPE_SECRET_KEY: str = "sk_test_xxx"
    STRIPE_PUBLISHABLE_KEY: str = "pk_test_xxx"
    
    # Upload
    MAX_UPLOAD_SIZE_MB: int = 50
    UPLOAD_DIR: str = "/app/uploads"
    
    # Quotas
    QUOTAS: dict = {
        "free": 5,
        "starter": 50,
        "pro": 500,
        "enterprise": 999999
    }
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()
