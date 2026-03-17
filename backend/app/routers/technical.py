import logging

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query

from app.config import get_settings
from app.deps import get_http_client, get_redis
from app.services.cache import cache_get, cache_set

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/technical", tags=["technical"])


@router.get("/{symbol}")
async def get_technical_analysis(
    symbol: str,
    http_client: httpx.AsyncClient = Depends(get_http_client),
    redis=Depends(get_redis),
):
    """Get full technical analysis from tvproxy for a symbol."""
    symbol = symbol.upper()
    settings = get_settings()

    cache_key = f"technical:{symbol}"
    cached = await cache_get(redis, cache_key)
    if cached:
        return cached

    try:
        resp = await http_client.get(f"{settings.TVPROXY_URL}/tv/ta/{symbol}")
        resp.raise_for_status()
        data = resp.json()
    except httpx.HTTPStatusError as e:
        logger.error("TVProxy TA error for %s: %s", symbol, e)
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"Failed to fetch technical analysis for {symbol}",
        )
    except Exception as e:
        logger.error("TVProxy TA error for %s: %s", symbol, e)
        raise HTTPException(
            status_code=502,
            detail=f"Failed to connect to technical analysis service for {symbol}",
        )

    await cache_set(redis, cache_key, data, ttl=120)
    return data


@router.get("/{symbol}/indicators")
async def get_indicators(
    symbol: str,
    indicator: str = Query(default="RSI", description="Indicator name (RSI, MACD, etc.)"),
    timeframe: str = Query(default="1D", description="Timeframe (1m, 5m, 15m, 1h, 4h, 1D, 1W)"),
    http_client: httpx.AsyncClient = Depends(get_http_client),
    redis=Depends(get_redis),
):
    """Get specific indicator data from tvproxy."""
    symbol = symbol.upper()
    settings = get_settings()

    cache_key = f"indicators:{symbol}:{indicator}:{timeframe}"
    cached = await cache_get(redis, cache_key)
    if cached:
        return cached

    try:
        resp = await http_client.get(
            f"{settings.TVPROXY_URL}/tv/indicators/{symbol}",
            params={"indicator": indicator, "timeframe": timeframe},
        )
        resp.raise_for_status()
        data = resp.json()
    except httpx.HTTPStatusError as e:
        logger.error("TVProxy indicators error for %s: %s", symbol, e)
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"Failed to fetch indicators for {symbol}",
        )
    except Exception as e:
        logger.error("TVProxy indicators error for %s: %s", symbol, e)
        raise HTTPException(
            status_code=502,
            detail=f"Failed to connect to indicator service for {symbol}",
        )

    await cache_set(redis, cache_key, data, ttl=120)
    return data
