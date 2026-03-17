import logging
import re
from typing import Any

import httpx
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

MYFXBOOK_URL = "https://www.myfxbook.com/community/outlook"

# Map Myfxbook symbol names to our standardized symbols
SYMBOL_MAPPING: dict[str, str] = {
    "EURUSD": "EURUSD",
    "GBPUSD": "GBPUSD",
    "USDJPY": "USDJPY",
    "AUDUSD": "AUDUSD",
    "USDCAD": "USDCAD",
    "USDCHF": "USDCHF",
    "NZDUSD": "NZDUSD",
    "EURGBP": "EURGBP",
    "EURJPY": "EURJPY",
    "GBPJPY": "GBPJPY",
    "EURAUD": "EURAUD",
    "EURCAD": "EURCAD",
    "EURCHF": "EURCHF",
    "AUDCAD": "AUDCAD",
    "AUDNZD": "AUDNZD",
    "GBPCAD": "GBPCAD",
    "GBPCHF": "GBPCHF",
    "GBPAUD": "GBPAUD",
    "XAUUSD": "XAUUSD",
}


def _parse_percentage(text: str) -> float | None:
    """Extract a percentage number from a string like '73%' or '73.5%'."""
    match = re.search(r"([\d.]+)", text.strip())
    if match:
        try:
            return float(match.group(1))
        except ValueError:
            return None
    return None


async def fetch_myfxbook_outlook(
    http_client: httpx.AsyncClient,
) -> list[dict[str, Any]]:
    """
    Scrape Myfxbook community outlook page for retail sentiment data.
    Returns list of {symbol, pct_long, pct_short}.
    """
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        ),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
    }

    try:
        resp = await http_client.get(MYFXBOOK_URL, headers=headers, follow_redirects=True)
        resp.raise_for_status()
        html = resp.text
    except httpx.HTTPStatusError as e:
        logger.error("Myfxbook HTTP error: %s", e)
        return []
    except Exception as e:
        logger.error("Myfxbook request error: %s", e)
        return []

    results: list[dict[str, Any]] = []

    try:
        soup = BeautifulSoup(html, "html.parser")

        # Myfxbook uses table rows or divs with symbol data
        # Look for the outlook table
        rows = soup.select("tr[id^='outlookSymbol']")
        if not rows:
            # Fallback: look for divs with symbol data
            rows = soup.select("div.outlookSymbol")

        if not rows:
            # Another fallback: look for table with specific class
            table = soup.find("table", {"id": "outlookSymbolsTable"})
            if table:
                rows = table.find_all("tr")[1:]  # skip header

        for row in rows:
            cells = row.find_all("td")
            if len(cells) < 3:
                continue

            # First cell typically has the symbol name
            symbol_text = cells[0].get_text(strip=True).upper().replace("/", "")

            # Normalize the symbol
            normalized = SYMBOL_MAPPING.get(symbol_text, symbol_text)

            # Find percentage cells (long and short)
            pct_long = None
            pct_short = None

            for cell in cells[1:]:
                text = cell.get_text(strip=True)
                pct = _parse_percentage(text)
                if pct is not None:
                    if pct_long is None:
                        pct_long = pct
                    elif pct_short is None:
                        pct_short = pct
                        break

            # If we only found one percentage, derive the other
            if pct_long is not None and pct_short is None:
                pct_short = 100.0 - pct_long
            elif pct_short is not None and pct_long is None:
                pct_long = 100.0 - pct_short

            if pct_long is not None:
                results.append({
                    "symbol": normalized,
                    "pct_long": round(pct_long, 1),
                    "pct_short": round(pct_short, 1) if pct_short else None,
                    "source": "myfxbook",
                })

        # If HTML scraping fails, try JSON endpoint
        if not results:
            logger.info("HTML parsing yielded no results, trying alternate extraction")
            # Look for embedded JSON data in script tags
            scripts = soup.find_all("script")
            for script in scripts:
                if script.string and "outlookData" in script.string:
                    # Extract JSON from script
                    match = re.search(r"outlookData\s*=\s*(\[.*?\]);", script.string, re.DOTALL)
                    if match:
                        import json
                        try:
                            data = json.loads(match.group(1))
                            for item in data:
                                sym = str(item.get("symbol", "")).upper().replace("/", "")
                                results.append({
                                    "symbol": SYMBOL_MAPPING.get(sym, sym),
                                    "pct_long": float(item.get("longPercentage", 0)),
                                    "pct_short": float(item.get("shortPercentage", 0)),
                                    "source": "myfxbook",
                                })
                        except (json.JSONDecodeError, ValueError):
                            pass

    except Exception as e:
        logger.error("Error parsing Myfxbook HTML: %s", e)

    if not results:
        logger.warning("No sentiment data extracted from Myfxbook")

    return results
