import asyncio
import logging
from datetime import datetime, timezone
from typing import Any, Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException

from app.config import get_settings
from app.deps import get_http_client, get_redis
from app.schemas.scorecard import ScorecardListResponse, ScorecardResponse, SubScore
from app.services.cache import cache_get, cache_set
from app.services.cot import fetch_cot_for_symbol
from app.services.fred import FRED_SERIES, fetch_series
from app.services.scoring import PAIR_COUNTRIES, compute_scorecard
from app.services.seasonality import compute_seasonality
from app.services.sentiment import fetch_myfxbook_outlook
from app.services.yfinance_svc import get_price_history

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/scorecard", tags=["scorecard"])

ASSET_SYMBOLS: dict[str, list[str]] = {
    "forex": [
        "EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD",
        "USDCHF", "NZDUSD", "EURGBP", "EURJPY", "GBPJPY",
    ],
    "crypto": ["BTCUSD", "ETHUSD", "SOLUSD", "XRPUSD", "ADAUSD"],
    "commodities": ["XAUUSD", "XAGUSD", "USOIL", "NGAS"],
    "indices": ["SPX500", "NAS100", "US30", "UK100", "DE40"],
}

TV_SYMBOL_MAP: dict[str, str] = {
    "EURUSD": "FX:EURUSD", "GBPUSD": "FX:GBPUSD", "USDJPY": "FX:USDJPY",
    "AUDUSD": "FX:AUDUSD", "USDCAD": "FX:USDCAD", "USDCHF": "FX:USDCHF",
    "NZDUSD": "FX:NZDUSD", "EURGBP": "FX:EURGBP", "EURJPY": "FX:EURJPY",
    "GBPJPY": "FX:GBPJPY",
    "BTCUSD": "CRYPTO:BTCUSD", "ETHUSD": "CRYPTO:ETHUSD",
    "SOLUSD": "CRYPTO:SOLUSD", "XRPUSD": "CRYPTO:XRPUSD", "ADAUSD": "CRYPTO:ADAUSD",
    "XAUUSD": "TVC:GOLD", "XAGUSD": "TVC:SILVER",
    "USOIL": "TVC:USOIL", "NGAS": "TVC:NATURALGAS",
    "SPX500": "FOREXCOM:SPXUSD", "NAS100": "FOREXCOM:NSXUSD",
    "US30": "FOREXCOM:DJI", "UK100": "FOREXCOM:UKXGBP", "DE40": "FOREXCOM:GRXEUR",
}


async def _fetch_ta(http_client: httpx.AsyncClient, symbol: str, tvproxy_url: str) -> Optional[dict]:
    """Fetch technical analysis from tvproxy."""
    tv_sym = TV_SYMBOL_MAP.get(symbol, symbol)
    try:
        resp = await http_client.get(f"{tvproxy_url}/tv/ta/{tv_sym}")
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        logger.warning("TA fetch failed for %s: %s", symbol, e)
        return None


async def _fetch_macro_data(
    http_client: httpx.AsyncClient, api_key: str, asset_class: str, symbol: str
) -> dict[str, Any]:
    """Fetch macro data relevant to the symbol."""
    result: dict[str, Any] = {}

    if asset_class == "forex":
        countries_pair = PAIR_COUNTRIES.get(symbol)
        if countries_pair:
            countries = list(set(countries_pair))
        else:
            countries = ["US"]
    else:
        countries = ["US"]

    for country in countries:
        country_series = FRED_SERIES.get(country, {})
        country_data: dict[str, list] = {}
        for indicator_name, series_id in country_series.items():
            try:
                data = await fetch_series(http_client, api_key, series_id, limit=5)
                country_data[indicator_name] = data
            except Exception as e:
                logger.warning("Failed to fetch %s for %s: %s", series_id, country, e)
                country_data[indicator_name] = []
        result[country] = country_data

    return result


def _error_scorecard(symbol: str, asset_class: str) -> ScorecardResponse:
    """Return a zeroed scorecard on error."""
    return ScorecardResponse(
        symbol=symbol,
        asset_class=asset_class,
        total_score=0.0,
        direction="NEUTRAL",
        technical=SubScore(value=0.0, label="NEUTRAL", details="Error computing"),
        sentiment=SubScore(value=0.0, label="NEUTRAL", details="Error computing"),
        cot=SubScore(value=0.0, label="NEUTRAL", details="Error computing"),
        fundamental=SubScore(value=0.0, label="NEUTRAL", details="Error computing"),
        seasonal=SubScore(value=0.0, label="NEUTRAL", details="Error computing"),
        computed_at=datetime.now(timezone.utc).isoformat(),
    )


async def _compute_single_scorecard(
    http_client: httpx.AsyncClient,
    redis: Any,
    symbol: str,
    asset_class: str,
    tvproxy_url: str,
    fred_api_key: str,
    all_sentiment: list[dict],
) -> ScorecardResponse:
    """Compute scorecard for a single symbol."""
    # Check cache first
    cache_key = f"scorecard:{asset_class}:{symbol}"
    cached = await cache_get(redis, cache_key)
    if cached:
        return ScorecardResponse(**cached)

    # Fetch data concurrently
    ta_task = _fetch_ta(http_client, symbol, tvproxy_url)
    cot_task = fetch_cot_for_symbol(http_client, symbol, limit=8)
    price_task = get_price_history(symbol, period="5y", interval="1mo")

    ta_data, cot_data, prices = await asyncio.gather(
        ta_task, cot_task, price_task, return_exceptions=True,
    )

    if isinstance(ta_data, Exception):
        logger.warning("TA error for %s: %s", symbol, ta_data)
        ta_data = None
    if isinstance(cot_data, Exception):
        logger.warning("COT error for %s: %s", symbol, cot_data)
        cot_data = None
    if isinstance(prices, Exception):
        logger.warning("Price error for %s: %s", symbol, prices)
        prices = []

    # Find sentiment for this symbol
    sentiment_data = None
    for s in all_sentiment:
        if s.get("symbol") == symbol:
            sentiment_data = s
            break

    # Compute seasonality
    seasonal_data = None
    if prices:
        seasonal_data = compute_seasonality(prices)

    # Fetch macro data
    macro_data = None
    try:
        macro_data = await _fetch_macro_data(http_client, fred_api_key, asset_class, symbol)
    except Exception as e:
        logger.warning("Macro data error for %s: %s", symbol, e)

    scorecard = compute_scorecard(
        symbol=symbol,
        asset_class=asset_class,
        ta_data=ta_data,
        sentiment_data=sentiment_data,
        cot_data=cot_data,
        macro_data=macro_data,
        seasonal_data=seasonal_data,
    )

    # Cache for 5 minutes
    await cache_set(redis, cache_key, scorecard.model_dump(), ttl=300)

    return scorecard


@router.get("/{asset_class}", response_model=ScorecardListResponse)
async def get_scorecards(
    asset_class: str,
    http_client: httpx.AsyncClient = Depends(get_http_client),
    redis=Depends(get_redis),
):
    """Compute and return scorecards for all symbols in an asset class."""
    if asset_class not in ASSET_SYMBOLS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid asset class: {asset_class}. Must be one of: {list(ASSET_SYMBOLS.keys())}",
        )

    settings = get_settings()
    symbols = ASSET_SYMBOLS[asset_class]

    # Pre-fetch sentiment data (shared across all symbols)
    all_sentiment: list[dict] = []
    try:
        all_sentiment = await fetch_myfxbook_outlook(http_client)
    except Exception as e:
        logger.warning("Bulk sentiment fetch failed: %s", e)

    # Compute all scorecards concurrently
    tasks = [
        _compute_single_scorecard(
            http_client, redis, sym, asset_class,
            settings.TVPROXY_URL, settings.FRED_API_KEY, all_sentiment,
        )
        for sym in symbols
    ]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    scorecards = []
    for sym, result in zip(symbols, results):
        if isinstance(result, Exception):
            logger.error("Scorecard computation failed for %s: %s", sym, result)
            scorecards.append(_error_scorecard(sym, asset_class))
        else:
            scorecards.append(result)

    return ScorecardListResponse(asset_class=asset_class, scorecards=scorecards)


@router.get("/{asset_class}/{symbol}", response_model=ScorecardResponse)
async def get_single_scorecard(
    asset_class: str,
    symbol: str,
    http_client: httpx.AsyncClient = Depends(get_http_client),
    redis=Depends(get_redis),
):
    """Compute and return scorecard for a single symbol."""
    if asset_class not in ASSET_SYMBOLS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid asset class: {asset_class}. Must be one of: {list(ASSET_SYMBOLS.keys())}",
        )

    symbol = symbol.upper()
    if symbol not in ASSET_SYMBOLS[asset_class]:
        raise HTTPException(
            status_code=404,
            detail=f"Symbol {symbol} not found in asset class {asset_class}",
        )

    settings = get_settings()

    # Fetch sentiment
    all_sentiment: list[dict] = []
    try:
        all_sentiment = await fetch_myfxbook_outlook(http_client)
    except Exception as e:
        logger.warning("Sentiment fetch failed: %s", e)

    return await _compute_single_scorecard(
        http_client, redis, symbol, asset_class,
        settings.TVPROXY_URL, settings.FRED_API_KEY, all_sentiment,
    )
