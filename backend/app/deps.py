import httpx
import redis.asyncio as aioredis
from fastapi import Depends, Request

from app.db.engine import get_db  # noqa: F401 – re-export

_http_client: httpx.AsyncClient | None = None


async def get_redis(request: Request) -> aioredis.Redis:
    return request.app.state.redis


async def get_http_client() -> httpx.AsyncClient:
    global _http_client
    if _http_client is None or _http_client.is_closed:
        _http_client = httpx.AsyncClient(timeout=httpx.Timeout(30.0))
    return _http_client
