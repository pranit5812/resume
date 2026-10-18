import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "CareerPilot AI"
    DATABASE_FILE: str = os.getenv("DATABASE_FILE", "careerpilot.db")

    # PostgreSQL / Supabase configuration
    DATABASE_URL: str = os.getenv("DATABASE_URL")

    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecretkey_change_in_production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days

    class Config:
        env_file = ".env"

settings = Settings()
