import asyncio
import sys
from sqlalchemy.ext.asyncio import create_async_engine

# Must import all models so SQLAlchemy's Base recognizes them
from app.modules.auth.models import User
from app.core.database import Base
from app.config import get_settings

settings = get_settings()

async def initialize_database():
    """
    Connects to Postgres and strictly executes a CREATE TABLE command for 
    any declarative classes that subclass Base.
    """
    print("\n[DB WIZARD] Booting Migration Engine...")
    print(f"Target DB: {settings.POSTGRES_DB} @ {settings.POSTGRES_HOST}")
    
    # We create a temporary throw-away engine just to run this operation
    startup_engine = create_async_engine(settings.async_database_url, echo=True)
    
    async with startup_engine.begin() as conn:
        print("[DB WIZARD] Dropping stale tables (if any) to ensure clean test state...")
        await conn.run_sync(Base.metadata.drop_all)
        
        print("[DB WIZARD] Building new tables from ORM Models...")
        await conn.run_sync(Base.metadata.create_all)
        
    await startup_engine.dispose()
    print("[DB WIZARD] Success! Auth Tables have been materialized in PostgreSQL.\n")

if __name__ == "__main__":
    v = sys.version_info
    if v.major == 3 and v.minor >= 8:
        asyncio.run(initialize_database())
    else:
        loop = asyncio.get_event_loop()
        loop.run_until_complete(initialize_database())
