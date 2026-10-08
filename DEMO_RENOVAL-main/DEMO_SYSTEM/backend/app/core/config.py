import os
from functools import lru_cache
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "RENOVAL SYS"
    VERSION: str = "2.0.0"
    DEBUG: bool = True

    SECRET_KEY: str = os.getenv("SECRET_KEY", "renoval_secret_key_2026_change_in_production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480

    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./renoval_system_db"
    )

    MYSQL_HOST: str = os.getenv("MYSQL_HOST", "localhost")
    MYSQL_PORT: int = int(os.getenv("MYSQL_PORT", "3306"))
    MYSQL_USER: str = os.getenv("MYSQL_USER", "renoval")
    MYSQL_PASSWORD: str = os.getenv("MYSQL_PASSWORD", "renoval2026")
    MYSQL_DATABASE: str = os.getenv("MYSQL_DATABASE", "renoval_db")

    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://demo-system-indol.vercel.app",
        "https://demo-system-ljmmkvhxi-tony12strs-projects.vercel.app",
    ]

    class Config:
        env_file = ".env"
        case_sensitive = True

    @property
    def mysql_url(self) -> str:
        return f"mysql+pymysql://{self.MYSQL_USER}:{self.MYSQL_PASSWORD}@{self.MYSQL_HOST}:{self.MYSQL_PORT}/{self.MYSQL_DATABASE}?charset=utf8mb4"


@lru_cache()
def get_settings() -> Settings:
    return Settings()