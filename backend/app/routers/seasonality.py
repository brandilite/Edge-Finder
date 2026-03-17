import logging

from fastapi import APIRouter, Depends, HTTPException

from app.deps import get_redis
from app.services.cache import cache_get, cache_set
from app.services.seasonality import compute_seasonality
from app.services.yfinance_svc import get_price_history

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/seasonality", tags=["seasonality"])


@router.get("/{symbol}")
async def get_seasonality(
    symbol: str,
    redis=Depends(get_redis),
):
    """Get 12-month seasonality data for a symbol based on historical price data."""
    symbol = symbol.upper()

    cache_key = f"seasonality:{symbol}"
    cached = await cache_get(redis, cache_key)
    if cached:
        return cached

    # Fetch 10 years of monthly data for robust seasonality
    prices = await get_price_history(symbol, period="10y", interval="1mo")

    if not prices:
        # Fallback to 5 years daily if monthly fails
        prices = await get_price_history(symbol, period="5y", interval="1d")

    if not prices:
        raise HTTPException(
            status_code=404,
            detail=f"No price history found for symbol: {symbol}",
        )

    seasonality = compute_seasonality(prices)

    if not seasonality:
        raise HTTPException(
            status_code=422,
            detail=f"Insufficient data to compute seasonality for: {symbol}",
        )

    result = {
        "symbol": symbol,
        "months": seasonality,
        "years_analyzed": max(s.get("years", 0) for s in seasonality) if seasonality else 0,
    }

    # Cache for 24 hours (seasonality changes slowly)
    await cache_set(redis, cache_key, result, ttl=86400)
    return result
