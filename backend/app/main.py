import logging
from contextlib import asynccontextmanager

import redis.asyncio as aioredis
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.config import get_settings
from app.db.engine import engine
from app.db.models import Base
from app.routers import (
    cot,
    economic,
    llm,
    macro,
    news,
    scorecard,
    seasonality,
    sentiment,
    symbols,
    technical,
)
from app.tasks.scheduler import start_scheduler, shutdown_scheduler

logger = logging.getLogger(__name__)

settings = get_settings()

redis_pool: aioredis.Redis | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global redis_pool
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables created/verified")

    # Init Redis
    redis_pool = aioredis.from_url(
        settings.REDIS_URL,
        encoding="utf-8",
        decode_responses=True,
    )
    try:
        await redis_pool.ping()
        logger.info("Redis connection established")
    except Exception as e:
        logger.warning("Redis not available: %s", e)

    app.state.redis = redis_pool

    # Start scheduler
    scheduler = start_scheduler()
    app.state.scheduler = scheduler
    logger.info("APScheduler started")

    yield

    # Shutdown
    shutdown_scheduler(scheduler)
    logger.info("APScheduler shut down")

    if redis_pool:
        await redis_pool.close()
        logger.info("Redis connection closed")

    await engine.dispose()
    logger.info("Database engine disposed")


app = FastAPI(
    title="EdgeFinder API",
    description="Multi-asset scoring and analysis platform",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scorecard.router, prefix="/api")
app.include_router(cot.router, prefix="/api")
app.include_router(sentiment.router, prefix="/api")
app.include_router(macro.router, prefix="/api")
app.include_router(economic.router, prefix="/api")
app.include_router(seasonality.router, prefix="/api")
app.include_router(technical.router, prefix="/api")
app.include_router(news.router, prefix="/api")
app.include_router(llm.router, prefix="/api")
app.include_router(symbols.router, prefix="/api")


@app.get("/health")
async def health():
    checks = {"status": "ok", "database": "unknown", "redis": "unknown"}
    try:
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1"))
        checks["database"] = "connected"
    except Exception as e:
        checks["database"] = f"error: {e}"
        checks["status"] = "degraded"

    try:
        if app.state.redis:
            await app.state.redis.ping()
            checks["redis"] = "connected"
    except Exception as e:
        checks["redis"] = f"error: {e}"
        checks["status"] = "degraded"

    return checks
