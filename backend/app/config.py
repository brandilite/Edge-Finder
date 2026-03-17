from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/edgefinder"
    REDIS_URL: str = "redis://localhost:6379/0"
    FRED_API_KEY: str = ""
    FINNHUB_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    TVPROXY_URL: str = "http://localhost:4000"

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


@lru_cache
def get_settings() -> Settings:
    return Settings()
