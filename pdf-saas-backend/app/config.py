from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    API_TITLE: str = "PDFMaster API"
    API_VERSION: str = "0.1.0"
    DEBUG: bool = True

    DATABASE_URL: str = "sqlite:///./pdf_saas.db"

    SECRET_KEY: str = "change-me-in-production-use-openssl-rand"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    STRIPE_SECRET_KEY: str = ""
    STRIPE_PUBLISHABLE_KEY: str = ""

    MAX_UPLOAD_SIZE_MB: int = 100
    UPLOAD_DIR: str = "./uploads"

    HF_TOKEN: str = ""

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings():
    return Settings()
