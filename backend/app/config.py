import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "Basketball AI Analyzer"
    UPLOAD_DIR: str = "uploads"
    PROCESSED_DIR: str = "processed"
    DATABASE_URL: str = "sqlite:///./basketball_ai.db"
    DEBUG: bool = True
    
    # Confidence thresholds
    POSE_CONFIDENCE_THRESHOLD: float = 0.5
    PROCESS_EVERY_N_FRAMES: int = 2
    
    class Config:
        env_file = ".env"

settings = Settings()

# Ensure directories exist
for directory in [settings.UPLOAD_DIR, settings.PROCESSED_DIR]:
    if not os.path.exists(directory):
        os.makedirs(directory)
