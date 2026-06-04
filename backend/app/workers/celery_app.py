import os
import urllib.parse
from celery import Celery
from celery.schedules import crontab

# Celery needs to know where Redis is. 
# Inside docker-compose, REDIS_PASSWORD is in .env and redis-cache is the host.
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = os.getenv("REDIS_PORT", "6379")
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", "")

if REDIS_PASSWORD:
    encoded_password = urllib.parse.quote_plus(REDIS_PASSWORD)
    broker_url = f"redis://:{encoded_password}@{REDIS_HOST}:{REDIS_PORT}/0"
else:
    broker_url = f"redis://{REDIS_HOST}:{REDIS_PORT}/0"

celery = Celery(
    "flatfit_worker",
    broker=broker_url,
    backend=broker_url,
    include=["app.workers.tasks"]
)

celery.conf.update(
    timezone="Asia/Kolkata",
    enable_utc=False,
    beat_schedule={
        "archive_yesterdays_leaderboard_midnight": {
            "task": "app.workers.tasks.archive_yesterday_leaderboard",
            # Run at exactly 12:01 AM IST every day
            "schedule": crontab(hour=0, minute=1),
        },
    }
)
