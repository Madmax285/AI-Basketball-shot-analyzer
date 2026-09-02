import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "Basketball AI Analyzer"
    UPLOAD_DIR: str = "uploads"
    DATABASE_URL: str = "sqlite:///./basketball_ai.db"
    DEBUG: bool = True
    
    class Config:
        env_file = ".env"

settings = Settings()

# Ensure upload directory exists
if not os.path.exists(settings.UPLOAD_DIR):
    os.makedirs(settings.UPLOAD_DIR)
