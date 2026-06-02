from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.core.redis_pool import RedisPool
from app.core.exceptions import APIException
from app.modules.auth.routes import router as auth_router
from app.modules.flats.routes import router as flats_router

settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Handles application startup and shutdown events cleanly.
    Replaces deprecated @app.on_event("startup")
    """
    # ========================== STARTUP ==========================
    # Initialize the Redis connection pool to be immediately ready for requests
    RedisPool.get_pool()
    print("🚀 FlatFit Backend Engine Started - Redis Pool Initialized")
    
    yield  # The application runs while execution pauses here
    
    # ========================== SHUTDOWN =========================
    print("🛑 Initiating graceful Application Shutdown...")
    await RedisPool.close_pool()
    print("✅ Redis Pool Connections Closed cleanly.")


# Initialize the core FastAPI Application instance
app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Backend Monolithic API Engine for the FlatFit Tracking Platform",
    lifespan=lifespan
)

# ==============================================================================
# MIDDLEWARE CONSTRUCTS
# ==============================================================================

# CORS Middleware (Crucial for React/Vite interaction)
app.add_middleware(
    CORSMiddleware,
    # In production, this should be restricted to the exact domain (e.g., https://flatfit.app)
    allow_origins=["*"] if settings.APP_ENV == "development" else ["https://yourproductiondomain.com"],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP verbs (POST, GET, PUT, DELETE, PATCH, etc.)
    allow_headers=["*"],  # Allow all headers (Authorization, Content-Type, etc.)
)


# ==============================================================================
# GLOBAL EXCEPTION HANDLERS
# ==============================================================================

@app.exception_handler(APIException)
async def api_exception_handler(request, exc: APIException):
    """
    Intercepts any standardized APIException raised anywhere in our application
    and transforms it into a clean JSON layout.
    """
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers=exc.headers
    )


# ==============================================================================
# ROUTER MOUNTING MULTIPLEXER
# ==============================================================================

# Mount the Authentication module domain space.
# It will be accessible globally via /api/v1/auth/...
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(flats_router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["System"])
async def root_healthcheck():
    """Network-level pinger endpoint utilized by Docker Compose and Nginx Healthchecks."""
    return {"status": "Active", "timezone": settings.TZ}
