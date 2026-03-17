import asyncio
import logging

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query

from app.config import get_settings
from app.deps import get_http_client, get_redis
from app.schemas.economic import EconomicDataPoint, EconomicIndicator
from app.services.cache import cache_get, cache_set
from app.services.fred import SERIES_META, fetch_release_dates, fetch_series, fetch_series_info

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/economic", tags=["economic"])


@router.get("/calendar")
async def get_economic_calendar(
    limit: int = Query(default=30, ge=1, le=100),
    http_client: httpx.AsyncClient = Depends(get_http_client),
    redis=Depends(get_redis),
):
    """Get upcoming economic release dates from FRED."""
    cache_key = f"economic:calendar:{limit}"
    cached = await cache_get(redis, cache_key)
    if cached:
        return cached

    settings = get_settings()
    releases = await fetch_release_dates(http_client, settings.FRED_API_KEY, limit=limit)

    result = {"count": len(releases), "releases": releases}
    await cache_set(redis, cache_key, result, ttl=3600)
    return result


@router.get("/series/{series_id}", response_model=EconomicIndicator)
async def get_series_data(
    series_id: str,
    limit: int = Query(default=100, ge=1, le=1000),
    http_client: httpx.AsyncClient = Depends(get_http_client),
    redis=Depends(get_redis),
):
    """Get historical data for a specific FRED series."""
    cache_key = f"economic:series:{series_id}:{limit}"
    cached = await cache_get(redis, cache_key)
    if cached:
        return EconomicIndicator(**cached)

    settings = get_settings()

    # Fetch data and info concurrently
    data_task = fetch_series(http_client, settings.FRED_API_KEY, series_id, limit=limit)
    info_task = fetch_series_info(http_client, settings.FRED_API_KEY, series_id)

    data, info = await asyncio.gather(data_task, info_task, return_exceptions=True)

    if isinstance(data, Exception):
        logger.error("Error fetching series %s: %s", series_id, data)
        raise HTTPException(status_code=502, detail=f"Failed to fetch series data: {series_id}")

    if isinstance(info, Exception):
        info = {}

    if not data:
        raise HTTPException(status_code=404, detail=f"No data found for series: {series_id}")

    # Determine country from our mapping
    meta = SERIES_META.get(series_id, ("", ""))
    country = meta[0]
    name = info.get("title", meta[1] or series_id)

    latest_value = data[0].get("value") if data else None
    latest_date = data[0].get("date") if data else None

    indicator = EconomicIndicator(
        series_id=series_id,
        name=name,
        country=country,
        frequency=info.get("frequency", ""),
        unit=info.get("units", ""),
        latest_value=latest_value,
        latest_date=latest_date,
        history=[EconomicDataPoint(date=dp["date"], value=dp["value"]) for dp in data],
    )

    await cache_set(redis, cache_key, indicator.model_dump(), ttl=21600)
    return indicator
