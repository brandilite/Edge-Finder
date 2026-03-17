import logging

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query

from app.config import get_settings
from app.deps import get_http_client, get_redis
from app.services.cache import cache_get, cache_set

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/symbols", tags=["symbols"])


@router.get("/search")
async def search_symbols(
    q: str = Query(..., min_length=1, description="Search query"),
    type: str = Query(default="", description="Asset type filter (forex, crypto, stock, etc.)"),
    http_client: httpx.AsyncClient = Depends(get_http_client),
    redis=Depends(get_redis),
):
    """Search for symbols via tvproxy."""
    cache_key = f"symbols:search:{q}:{type}"
    cached = await cache_get(redis, cache_key)
    if cached:
        return cached

    settings = get_settings()
    params = {"q": q}
    if type:
        params["type"] = type

    try:
        resp = await http_client.get(
            f"{settings.TVPROXY_URL}/tv/search",
            params=params,
        )
        resp.raise_for_status()
        data = resp.json()
    except httpx.HTTPStatusError as e:
        logger.error("TVProxy search error: %s", e)
        raise HTTPException(
            status_code=e.response.status_code,
            detail="Failed to search symbols",
        )
    except Exception as e:
        logger.error("TVProxy search error: %s", e)
        raise HTTPException(status_code=502, detail="Failed to connect to symbol search service")

    await cache_set(redis, cache_key, data, ttl=300)
    return data


@router.get("/{symbol}/quote")
async def get_quote(
    symbol: str,
    http_client: httpx.AsyncClient = Depends(get_http_client),
    redis=Depends(get_redis),
):
    """Get real-time quote for a symbol from tvproxy."""
    symbol = symbol.upper()
    settings = get_settings()

    cache_key = f"symbols:quote:{symbol}"
    cached = await cache_get(redis, cache_key)
    if cached:
        return cached

    try:
        resp = await http_client.get(f"{settings.TVPROXY_URL}/tv/quotes/{symbol}")
        resp.raise_for_status()
        data = resp.json()
    except httpx.HTTPStatusError as e:
        logger.error("TVProxy quote error for %s: %s", symbol, e)
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"Failed to fetch quote for {symbol}",
        )
    except Exception as e:
        logger.error("TVProxy quote error for %s: %s", symbol, e)
        raise HTTPException(
            status_code=502,
            detail=f"Failed to connect to quote service for {symbol}",
        )

    # Short cache for real-time quotes
    await cache_set(redis, cache_key, data, ttl=15)
    return data


@router.get("/{symbol}/candles")
async def get_candles(
    symbol: str,
    timeframe: str = Query(default="1D", description="Candle timeframe (1m, 5m, 15m, 1h, 4h, 1D, 1W)"),
    count: int = Query(default=300, ge=1, le=5000, description="Number of candles"),
    http_client: httpx.AsyncClient = Depends(get_http_client),
    redis=Depends(get_redis),
):
    """Get OHLCV candles for a symbol from tvproxy."""
    symbol = symbol.upper()
    settings = get_settings()

    cache_key = f"symbols:candles:{symbol}:{timeframe}:{count}"
    cached = await cache_get(redis, cache_key)
    if cached:
        return cached

    try:
        resp = await http_client.get(
            f"{settings.TVPROXY_URL}/tv/candles/{symbol}",
            params={"timeframe": timeframe, "count": count},
        )
        resp.raise_for_status()
        data = resp.json()
    except httpx.HTTPStatusError as e:
        logger.error("TVProxy candles error for %s: %s", symbol, e)
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"Failed to fetch candles for {symbol}",
        )
    except Exception as e:
        logger.error("TVProxy candles error for %s: %s", symbol, e)
        raise HTTPException(
            status_code=502,
            detail=f"Failed to connect to candle service for {symbol}",
        )

    # Cache based on timeframe
    ttl = 60 if timeframe in ("1m", "5m") else 300
    await cache_set(redis, cache_key, data, ttl=ttl)
    return data
