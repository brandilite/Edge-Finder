import logging

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query

from app.deps import get_http_client, get_redis
from app.schemas.cot import COTData, COTResponse
from app.services.cache import cache_get, cache_set
from app.services.cot import SYMBOL_TO_CFTC, fetch_cot_data, fetch_cot_for_symbol

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/cot", tags=["cot"])


@router.get("", response_model=list[COTResponse])
async def get_all_cot(
    http_client: httpx.AsyncClient = Depends(get_http_client),
    redis=Depends(get_redis),
):
    """Get latest COT data for all tracked commodities."""
    cache_key = "cot:all:latest"
    cached = await cache_get(redis, cache_key)
    if cached:
        return [COTResponse(**item) for item in cached]

    results = []
    for symbol, cftc_code in SYMBOL_TO_CFTC.items():
        try:
            records = await fetch_cot_data(http_client, commodity_code=cftc_code, limit=1)
            latest = COTData(**records[0]) if records else None
            results.append(COTResponse(symbol=symbol, latest=latest, history=[]))
        except Exception as e:
            logger.warning("COT fetch failed for %s: %s", symbol, e)
            results.append(COTResponse(symbol=symbol, latest=None, history=[]))

    await cache_set(redis, cache_key, [r.model_dump() for r in results], ttl=3600)
    return results


@router.get("/{symbol}", response_model=COTResponse)
async def get_cot_by_symbol(
    symbol: str,
    weeks: int = Query(default=52, ge=1, le=260),
    http_client: httpx.AsyncClient = Depends(get_http_client),
    redis=Depends(get_redis),
):
    """Get COT history for a specific symbol (last N weeks)."""
    symbol = symbol.upper()

    cache_key = f"cot:{symbol}:{weeks}"
    cached = await cache_get(redis, cache_key)
    if cached:
        return COTResponse(**cached)

    records = await fetch_cot_for_symbol(http_client, symbol, limit=weeks)
    if not records:
        # Try direct CFTC code lookup
        cftc_code = SYMBOL_TO_CFTC.get(symbol)
        if cftc_code:
            records = await fetch_cot_data(http_client, commodity_code=cftc_code, limit=weeks)

    if not records:
        raise HTTPException(
            status_code=404,
            detail=f"No COT data found for symbol: {symbol}",
        )

    history = [COTData(**r) for r in records]
    latest = history[0] if history else None
    response = COTResponse(symbol=symbol, latest=latest, history=history)

    await cache_set(redis, cache_key, response.model_dump(), ttl=3600)
    return response
