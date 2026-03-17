import asyncio
import logging

import httpx
from fastapi import APIRouter, Depends, HTTPException

from app.config import get_settings
from app.deps import get_http_client, get_redis
from app.schemas.economic import EconomicDataPoint, EconomicIndicator, MacroDashboard
from app.services.cache import cache_get, cache_set
from app.services.fred import FRED_SERIES, fetch_series

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/macro", tags=["macro"])

VALID_COUNTRIES = list(FRED_SERIES.keys())


@router.get("/{country}", response_model=MacroDashboard)
async def get_macro_dashboard(
    country: str,
    http_client: httpx.AsyncClient = Depends(get_http_client),
    redis=Depends(get_redis),
):
    """Get macro economic dashboard for a country with all indicators and latest values."""
    country = country.upper()

    if country not in VALID_COUNTRIES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid country: {country}. Must be one of: {VALID_COUNTRIES}",
        )

    cache_key = f"macro:{country}"
    cached = await cache_get(redis, cache_key)
    if cached:
        return MacroDashboard(**cached)

    settings = get_settings()
    country_series = FRED_SERIES[country]

    # Fetch all series concurrently
    tasks = {}
    for indicator_name, series_id in country_series.items():
        tasks[indicator_name] = fetch_series(
            http_client, settings.FRED_API_KEY, series_id, limit=24
        )

    gathered = await asyncio.gather(*tasks.values(), return_exceptions=True)

    indicators = []
    for (indicator_name, series_id), result in zip(country_series.items(), gathered):
        if isinstance(result, Exception):
            logger.warning("Failed to fetch %s (%s): %s", indicator_name, series_id, result)
            history = []
        else:
            history = result

        latest_value = None
        latest_date = None
        if history:
            latest_value = history[0].get("value")
            latest_date = history[0].get("date")

        indicators.append(EconomicIndicator(
            series_id=series_id,
            name=indicator_name,
            country=country,
            latest_value=latest_value,
            latest_date=latest_date,
            history=[
                EconomicDataPoint(date=dp["date"], value=dp["value"])
                for dp in history
            ],
        ))

    dashboard = MacroDashboard(country=country, indicators=indicators)
    await cache_set(redis, cache_key, dashboard.model_dump(), ttl=21600)
    return dashboard
