from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import text
from sqlalchemy.orm import declarative_base
from app.config import get_settings

settings = get_settings()

# Initialize the async database engine
# Expected usage is with asyncpg driver
engine = create_async_engine(
    settings.async_database_url,
    echo=settings.APP_ENV == "development", # Logs SQL queries only in dev
    pool_size=10, # Maintain up to 10 connections in pool
    max_overflow=20, # Allow up to 20 temporary connections beyond pool_size under high load
    pool_pre_ping=True, # Test connections before using them to handle drops
)

# Create an async session factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False, # Protects against detached instance errors after committing
    autocommit=False,
    autoflush=False
)

# Declarative base class for our models
Base = declarative_base()

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency injection function for FastAPI routes.
    Yields an active database session for the request and ensures 
    it is cleanly closed/rolled back as the request ends.
    """
    async with AsyncSessionLocal() as session:
        try:
            # We enforce strict UTC offset/timezone explicitly per session. 
            # (PostgreSQL config normally defaults, but it doesn't hurt to explicitly enforce timezone parameters).
            await session.execute(text("SET TIME ZONE 'Asia/Kolkata'"))
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
