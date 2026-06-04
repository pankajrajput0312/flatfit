import asyncio
import uuid
import sys
from datetime import datetime
from zoneinfo import ZoneInfo
from sqlalchemy.future import select

from app.core.database import AsyncSessionLocal
from app.core.redis_pool import RedisPool
from app.modules.auth.models import User
from app.core.security import get_password_hash
from app.modules.leaderboards.services import LeaderboardService

IST = ZoneInfo("Asia/Kolkata")

async def seed():
    print("Generating dummy data...")
    today = datetime.now(IST).date()
    
    # 1. Create 5 dummy users
    dummy_users = [
        {"username": "iron_mike", "email": "mike@test.com", "full_name": "Mike Tyson"},
        {"username": " Serena_W", "email": "serena@test.com", "full_name": "Serena Williams"},
        {"username": "usain_bolt", "email": "usain@test.com", "full_name": "Usain Bolt"},
        {"username": "phelps", "email": "phelps@test.com", "full_name": "Michael Phelps"},
        {"username": "gym_bro", "email": "bro@test.com", "full_name": "Chad Gymbro"},
    ]
    
    db_users = []
    async with AsyncSessionLocal() as session:
        for u_data in dummy_users:
            # Check if user already exists
            res = await session.execute(select(User).where(User.username == u_data["username"]))
            existing = res.scalars().first()
            if not existing:
                new_user = User(
                    username=u_data["username"],
                    email=u_data["email"],
                    full_name=u_data["full_name"],
                    hashed_password=get_password_hash("password123")
                )
                session.add(new_user)
                db_users.append(new_user)
            else:
                db_users.append(existing)
                
        await session.commit()
        
        # Refresh to get their UUIDs
        for u in db_users:
            await session.refresh(u)

    print("PostgreSQL users seeded. Seeding Redis Leaderboards...")
    
    # 2. Inject fake points directly into Redis
    daily_key = LeaderboardService._build_redis_key("daily", today)
    weekly_key = LeaderboardService._build_redis_key("weekly", today)
    monthly_key = LeaderboardService._build_redis_key("monthly", today)

    # Assign random points simulating past workouts
    points_to_award = [250, 180, 120, 90, 30] 
    
    redis_client = await RedisPool.get_client()
    try:
        async with redis_client.pipeline(transaction=True) as pipe:
            for user, points in zip(db_users, points_to_award):
                user_id_str = str(user.id)
                pipe.zincrby(daily_key, points, user_id_str)
                pipe.zincrby(weekly_key, points * 3, user_id_str)  # Simulating a multi-day streak for weekly
                pipe.zincrby(monthly_key, points * 10, user_id_str) # Simulating long month
            await pipe.execute()
    finally:
        await redis_client.close()

    print("====================================")
    print("Dummy Seeding Complete!")
    print("====================================")
    print(f"Top user should now be {db_users[0].full_name} with {points_to_award[0]} points.")
    print("Go to Swagger UI -> GET /leaderboards/global and click execute!")

if __name__ == "__main__":
    asyncio.run(seed())
