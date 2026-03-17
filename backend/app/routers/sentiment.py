import logging

import httpx
from fastapi import APIRouter, Depends, HTTPException

from app.deps import get_http_client, get_redis
from app.schemas.sentiment import SentimentData, SentimentResponse
from app.services.cache import cache_get, cache_set
from app.services.sentiment import fetch_myfxbook_outlook

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/sentiment", tags=["sentiment"])


@router.get("", response_model=SentimentResponse)
async def get_all_sentiment(
    http_client: httpx.AsyncClient = Depends(get_http_client),
    redis=Depends(get_redis),
):
    """Get retail sentiment data for all available symbols."""
    cache_key = "sentiment:all"
    cached = await cache_get(redis, cache_key)
    if cached:
        return SentimentResponse(**cached)

    raw_data = await fetch_myfxbook_outlook(http_client)

    symbols = [
        SentimentData(
            symbol=item["symbol"],
            pct_long=item.get("pct_long"),
            pct_short=item.get("pct_short"),
            source=item.get("source", "myfxbook"),
            fetched_at=None,
        )
        for item in raw_data
    ]

    response = SentimentResponse(symbols=symbols)
    await cache_set(redis, cache_key, response.model_dump(), ttl=900)
    return response


@router.get("/{symbol}", response_model=SentimentData)
async def get_symbol_sentiment(
    symbol: str,
    http_client: httpx.AsyncClient = Depends(get_http_client),
    redis=Depends(get_redis),
):
    """Get retail sentiment for a specific symbol."""
    symbol = symbol.upper()

    cache_key = f"sentiment:{symbol}"
    cached = await cache_get(redis, cache_key)
    if cached:
        return SentimentData(**cached)

    raw_data = await fetch_myfxbook_outlook(http_client)

    for item in raw_data:
        if item["symbol"] == symbol:
            result = SentimentData(
                symbol=item["symbol"],
                pct_long=item.get("pct_long"),
                pct_short=item.get("pct_short"),
                source=item.get("source", "myfxbook"),
                fetched_at=None,
            )
            await cache_set(redis, cache_key, result.model_dump(), ttl=900)
            return result

    raise HTTPException(
        status_code=404,
        detail=f"No sentiment data found for symbol: {symbol}",
    )
