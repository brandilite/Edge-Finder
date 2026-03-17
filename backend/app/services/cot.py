import logging
from typing import Any, Optional

import httpx

logger = logging.getLogger(__name__)

CFTC_API_URL = "https://publicreporting.cftc.gov/resource/6dca-aqww.json"

SYMBOL_TO_CFTC: dict[str, str] = {
    "EUR": "099741",
    "GBP": "096742",
    "JPY": "097741",
    "AUD": "232741",
    "CAD": "090741",
    "CHF": "092741",
    "NZD": "112741",
    "GOLD": "088691",
    "SILVER": "084691",
    "CRUDE": "067651",
    "NATGAS": "023651",
    "SP500": "13874A",
    "NASDAQ": "209742",
    "DOW": "124601",
}

# Reverse mapping for convenience
CFTC_TO_SYMBOL: dict[str, str] = {v: k for k, v in SYMBOL_TO_CFTC.items()}

# Map trading symbols to COT base currency
PAIR_TO_COT: dict[str, str] = {
    "EURUSD": "EUR",
    "GBPUSD": "GBP",
    "USDJPY": "JPY",
    "AUDUSD": "AUD",
    "USDCAD": "CAD",
    "USDCHF": "CHF",
    "NZDUSD": "NZD",
    "EURGBP": "EUR",
    "EURJPY": "EUR",
    "GBPJPY": "GBP",
    "XAUUSD": "GOLD",
    "XAGUSD": "SILVER",
    "USOIL": "CRUDE",
    "NGAS": "NATGAS",
    "SPX500": "SP500",
    "NAS100": "NASDAQ",
    "US30": "DOW",
}


def parse_cot_record(record: dict[str, Any]) -> dict[str, Any]:
    """Parse a raw CFTC COT record into a clean dict."""

    def safe_float(val: Any) -> Optional[float]:
        if val is None:
            return None
        try:
            return float(val)
        except (ValueError, TypeError):
            return None

    noncomm_long = safe_float(record.get("noncomm_positions_long_all"))
    noncomm_short = safe_float(record.get("noncomm_positions_short_all"))
    comm_long = safe_float(record.get("comm_positions_long_all"))
    comm_short = safe_float(record.get("comm_positions_short_all"))

    noncomm_net = None
    if noncomm_long is not None and noncomm_short is not None:
        noncomm_net = noncomm_long - noncomm_short

    comm_net = None
    if comm_long is not None and comm_short is not None:
        comm_net = comm_long - comm_short

    return {
        "report_date": record.get("report_date_as_yyyy_mm_dd", ""),
        "commodity_name": record.get("commodity_name", "").strip(),
        "cftc_code": record.get("cftc_contract_market_code", ""),
        "open_interest": safe_float(record.get("open_interest_all")),
        "noncomm_long": noncomm_long,
        "noncomm_short": noncomm_short,
        "noncomm_net": noncomm_net,
        "comm_long": comm_long,
        "comm_short": comm_short,
        "comm_net": comm_net,
        "pct_noncomm_long": safe_float(record.get("pct_of_oi_noncomm_long_all")),
        "pct_noncomm_short": safe_float(record.get("pct_of_oi_noncomm_short_all")),
    }


async def fetch_cot_data(
    http_client: httpx.AsyncClient,
    commodity_code: Optional[str] = None,
    limit: int = 52,
) -> list[dict[str, Any]]:
    """Fetch COT data from CFTC Socrata API."""
    params: dict[str, Any] = {
        "$order": "report_date_as_yyyy_mm_dd DESC",
        "$limit": limit,
    }

    if commodity_code:
        params["$where"] = f"cftc_contract_market_code='{commodity_code}'"

    try:
        resp = await http_client.get(CFTC_API_URL, params=params)
        resp.raise_for_status()
        records = resp.json()
        return [parse_cot_record(r) for r in records]
    except httpx.HTTPStatusError as e:
        logger.error("CFTC API HTTP error: %s", e)
        return []
    except Exception as e:
        logger.error("CFTC API error: %s", e)
        return []


async def fetch_cot_for_symbol(
    http_client: httpx.AsyncClient,
    symbol: str,
    limit: int = 52,
) -> list[dict[str, Any]]:
    """Fetch COT data for a trading symbol. Maps symbol to CFTC code first."""
    cot_key = PAIR_TO_COT.get(symbol, symbol)
    cftc_code = SYMBOL_TO_CFTC.get(cot_key)
    if not cftc_code:
        logger.warning("No CFTC code mapping for symbol %s (key=%s)", symbol, cot_key)
        return []
    return await fetch_cot_data(http_client, commodity_code=cftc_code, limit=limit)
