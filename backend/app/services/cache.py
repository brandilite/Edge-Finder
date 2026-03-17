import json
import logging
from typing import Any, Optional

import redis.asyncio as aioredis

logger = logging.getLogger(__name__)


async def cache_get(redis: aioredis.Redis, key: str) -> Optional[Any]:
    """Retrieve a cached value by key, deserializing from JSON."""
    try:
        raw = await redis.get(key)
        if raw is None:
            return None
        return json.loads(raw)
    except Exception as e:
        logger.warning("Cache get error for key=%s: %s", key, e)
        return None


async def cache_set(
    redis: aioredis.Redis, key: str, data: Any, ttl: int = 300
) -> bool:
    """Store a value in cache as JSON with a TTL in seconds."""
    try:
        serialized = json.dumps(data, default=str)
        await redis.set(key, serialized, ex=ttl)
        return True
    except Exception as e:
        logger.warning("Cache set error for key=%s: %s", key, e)
        return False


async def cache_delete(redis: aioredis.Redis, pattern: str) -> int:
    """Delete all keys matching a glob pattern. Returns number deleted."""
    try:
        deleted = 0
        async for key in redis.scan_iter(match=pattern, count=100):
            await redis.delete(key)
            deleted += 1
        return deleted
    except Exception as e:
        logger.warning("Cache delete error for pattern=%s: %s", pattern, e)
        return 0
