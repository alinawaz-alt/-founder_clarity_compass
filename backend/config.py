import os
from pydantic_settings import BaseSettings
from typing import List, Optional

class Settings(BaseSettings):
    MONGODB_URL: str
    PORT: int = 8000
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:5137"]
    APP_ENV: str = "development"

    # SMTP Settings
    SMTP_SERVER: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USERNAME: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM_EMAIL: str = "noreply@foundercompass.com"

    class Config:
        env_file = os.path.join(os.path.dirname(__file__), ".env")

settings = Settings()