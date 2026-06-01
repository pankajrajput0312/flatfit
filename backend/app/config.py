from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    """
    Application configuration parsed from environment variables.
    Pydantic v2 automatically validates the types.
    """
    # Core app settings
    PROJECT_NAME: str = "FlatFit Platform"
    API_V1_STR: str = "/api/v1"
    
    # Environment
    APP_ENV: str = "development"
    TZ: str = "Asia/Kolkata"

    # PostgreSQL Database
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    POSTGRES_HOST: str = "postgres-db"
    POSTGRES_PORT: int = 5432
    
    @property
    def async_database_url(self) -> str:
        """Constructs the async PostgreSQL connection string."""
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
    
    @property
    def sync_database_url(self) -> str:
        """Constructs the sync PostgreSQL connection string (useful for basic scripts/alembic)."""
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    # Redis Cache / Storage
    REDIS_HOST: str = "redis-cache"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: str
    
    @property
    def redis_url(self) -> str:
        """Constructs the Redis connection string."""
        return f"redis://:{self.REDIS_PASSWORD}@{self.REDIS_HOST}:{self.REDIS_PORT}/0"

    # Security
    JWT_SECRET_KEY: str
    JWT_REFRESH_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Email SMTP Relay
    SMTP_HOST: str
    SMTP_PORT: int
    SMTP_USER: str
    SMTP_PASSWORD: str
    EMAILS_FROM_EMAIL: str
    
    # Validation settings based on strict .env configuration
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", case_sensitive=True, extra="ignore")

@lru_cache()
def get_settings() -> Settings:
    """
    Cached settings instance to prevent reading the .env file multiple times.
    """
    return Settings()
