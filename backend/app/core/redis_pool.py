from redis import asyncio as redis
from app.config import get_settings

settings = get_settings()

class RedisPool:
    """
    Singleton connection manager for Redis to prevent exhausting connection 
    ports during high traffic surges (like end of day scoreboard checks).
    """
    _pool: redis.ConnectionPool = None

    @classmethod
    def get_pool(cls) -> redis.ConnectionPool:
        if cls._pool is None:
            # Pass connection parameters explicitly to bypass urllib parsing bugs with complex passwords
            cls._pool = redis.ConnectionPool(
                host=settings.REDIS_HOST,
                port=settings.REDIS_PORT,
                password=settings.REDIS_PASSWORD,
                db=0,
                decode_responses=True,
                max_connections=500  # Protection limit against connection flooding
            )
        return cls._pool

    @classmethod
    async def get_client(cls) -> redis.Redis:
        """
        Creates and yields a client binding leveraging the persistent pool.
        """
        return redis.Redis.from_pool(cls.get_pool())

    @classmethod
    async def close_pool(cls):
        """
        Gracefully terminates the pool during application shutdown.
        """
        if cls._pool is not None:
            await cls._pool.disconnect()

async def get_redis() -> redis.Redis:
    """
    FastAPI Dependency that yields an active Redis client connecting to our memory-store.
    Useful for route injection.
    """
    client = await RedisPool.get_client()
    try:
        yield client
    finally:
        # We invoke close() to release the connection back to the ConnectionPool (does not destroy the socket)
        await client.close()
