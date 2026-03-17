import logging
from typing import Any

import httpx

logger = logging.getLogger(__name__)

FRED_BASE_URL = "https://api.stlouisfed.org/fred"

FRED_SERIES: dict[str, dict[str, str]] = {
    "US": {
        "GDP": "GDP",
        "CPI": "CPIAUCSL",
        "CORE_CPI": "CPILFESL",
        "PPI": "PPIACO",
        "NFP": "PAYEMS",
        "UNEMPLOYMENT": "UNRATE",
        "FED_FUNDS": "FEDFUNDS",
        "PMI_MFG": "MANEMP",
        "RETAIL_SALES": "RSAFS",
        "INDUSTRIAL_PROD": "INDPRO",
    },
    "EU": {
        "GDP": "EUNNGDP",
        "CPI": "EA19CPALTT01GYM",
        "UNEMPLOYMENT": "LRHUTTTTEZM156S",
    },
    "UK": {
        "GDP": "UKNGDP",
        "CPI": "GBRCPIALLMINMEI",
        "UNEMPLOYMENT": "LMUNRRTTGBM156S",
    },
    "JP": {
        "GDP": "JPNNGDP",
        "CPI": "JPNCPIALLMINMEI",
    },
    "CA": {
        "GDP": "NGDPSAXDCCAQ",
        "CPI": "CANCPIALLMINMEI",
        "UNEMPLOYMENT": "LRUNTTTTCAM156S",
    },
    "AU": {
        "GDP": "NAEXKP01AUQ189S",
        "CPI": "AUSCPIALLQINMEI",
        "UNEMPLOYMENT": "LRUNTTTTAUM156S",
    },
}

# Flat lookup: series_id -> (country, indicator_name)
SERIES_META: dict[str, tuple[str, str]] = {}
for _country, _indicators in FRED_SERIES.items():
    for _name, _sid in _indicators.items():
        SERIES_META[_sid] = (_country, _name)


async def fetch_series(
    http_client: httpx.AsyncClient,
    api_key: str,
    series_id: str,
    limit: int = 100,
) -> list[dict[str, Any]]:
    """Fetch observations for a FRED series. Returns list of {date, value}."""
    if not api_key:
        logger.warning("No FRED API key configured")
        return []

    url = f"{FRED_BASE_URL}/series/observations"
    params = {
        "series_id": series_id,
        "api_key": api_key,
        "file_type": "json",
        "sort_order": "desc",
        "limit": limit,
    }

    try:
        resp = await http_client.get(url, params=params)
        resp.raise_for_status()
        data = resp.json()
        observations = data.get("observations", [])

        results = []
        for obs in observations:
            val = obs.get("value", ".")
            if val == "." or val is None:
                continue
            try:
                results.append({
                    "date": obs["date"],
                    "value": float(val),
                })
            except (ValueError, TypeError):
                continue
        return results
    except httpx.HTTPStatusError as e:
        logger.error("FRED API HTTP error for %s: %s", series_id, e)
        return []
    except Exception as e:
        logger.error("FRED API error for %s: %s", series_id, e)
        return []


async def fetch_multiple_series(
    http_client: httpx.AsyncClient,
    api_key: str,
    series_ids: list[str],
) -> dict[str, list[dict[str, Any]]]:
    """Fetch multiple FRED series concurrently."""
    import asyncio

    tasks = {
        sid: fetch_series(http_client, api_key, sid)
        for sid in series_ids
    }
    results: dict[str, list[dict[str, Any]]] = {}
    gathered = await asyncio.gather(*tasks.values(), return_exceptions=True)

    for sid, result in zip(tasks.keys(), gathered):
        if isinstance(result, Exception):
            logger.error("Error fetching FRED series %s: %s", sid, result)
            results[sid] = []
        else:
            results[sid] = result

    return results


async def fetch_series_info(
    http_client: httpx.AsyncClient,
    api_key: str,
    series_id: str,
) -> dict[str, Any]:
    """Fetch metadata for a FRED series."""
    if not api_key:
        return {}

    url = f"{FRED_BASE_URL}/series"
    params = {
        "series_id": series_id,
        "api_key": api_key,
        "file_type": "json",
    }

    try:
        resp = await http_client.get(url, params=params)
        resp.raise_for_status()
        data = resp.json()
        serieses = data.get("seriess", [])
        if serieses:
            s = serieses[0]
            return {
                "series_id": s.get("id", series_id),
                "title": s.get("title", ""),
                "frequency": s.get("frequency_short", ""),
                "units": s.get("units_short", ""),
            }
        return {}
    except Exception as e:
        logger.error("FRED series info error for %s: %s", series_id, e)
        return {}


async def fetch_release_dates(
    http_client: httpx.AsyncClient,
    api_key: str,
    limit: int = 30,
) -> list[dict[str, Any]]:
    """Fetch upcoming FRED release dates for the calendar."""
    if not api_key:
        return []

    url = f"{FRED_BASE_URL}/releases/dates"
    params = {
        "api_key": api_key,
        "file_type": "json",
        "include_release_dates_with_no_data": "true",
        "sort_order": "asc",
        "limit": limit,
    }

    try:
        resp = await http_client.get(url, params=params)
        resp.raise_for_status()
        data = resp.json()
        release_dates = data.get("release_dates", [])
        results = []
        for rd in release_dates:
            results.append({
                "release_id": rd.get("release_id"),
                "release_name": rd.get("release_name", ""),
                "date": rd.get("date", ""),
            })
        return results
    except Exception as e:
        logger.error("FRED release dates error: %s", e)
        return []
