import logging
from datetime import datetime, timezone
from typing import Any, Optional

import httpx

logger = logging.getLogger(__name__)

FINNHUB_BASE_URL = "https://finnhub.io/api/v1"


def parse_finnhub_news(raw_item: dict[str, Any]) -> dict[str, Any]:
    """Parse a raw Finnhub news item into our standard schema."""
    published_at = None
    ts = raw_item.get("datetime")
    if ts:
        try:
            published_at = datetime.fromtimestamp(ts, tz=timezone.utc).isoformat()
        except (ValueError, OSError, TypeError):
            pass

    related = raw_item.get("related", "")
    related_symbols = [s.strip() for s in related.split(",") if s.strip()] if related else None

    # Basic sentiment scoring from headline keywords
    headline = raw_item.get("headline", "")
    sentiment_score, sentiment_label = _basic_sentiment(headline)

    return {
        "external_id": str(raw_item.get("id", "")),
        "headline": headline,
        "summary": raw_item.get("summary", ""),
        "source": raw_item.get("source", ""),
        "url": raw_item.get("url", ""),
        "image_url": raw_item.get("image", ""),
        "published_at": published_at,
        "category": raw_item.get("category", ""),
        "related_symbols": related_symbols,
        "sentiment_score": sentiment_score,
        "sentiment_label": sentiment_label,
    }


def _basic_sentiment(text: str) -> tuple[Optional[float], Optional[str]]:
    """Very basic keyword-based sentiment scoring."""
    if not text:
        return None, None

    text_lower = text.lower()

    positive_words = [
        "surge", "rally", "gain", "jump", "rise", "bullish", "soar",
        "high", "boost", "up", "growth", "profit", "strong", "beat",
        "exceed", "positive", "advance", "recover", "upgrade",
    ]
    negative_words = [
        "fall", "drop", "decline", "crash", "bearish", "plunge",
        "low", "loss", "down", "weak", "miss", "cut", "fear",
        "risk", "sell", "slump", "recession", "negative", "downgrade",
    ]

    pos_count = sum(1 for w in positive_words if w in text_lower)
    neg_count = sum(1 for w in negative_words if w in text_lower)

    total = pos_count + neg_count
    if total == 0:
        return 0.0, "neutral"

    score = (pos_count - neg_count) / total
    if score > 0.2:
        label = "positive"
    elif score < -0.2:
        label = "negative"
    else:
        label = "neutral"

    return round(score, 3), label


async def fetch_market_news(
    http_client: httpx.AsyncClient,
    api_key: str,
    category: str = "general",
) -> list[dict[str, Any]]:
    """Fetch general market news from Finnhub."""
    if not api_key:
        logger.warning("No Finnhub API key configured")
        return []

    url = f"{FINNHUB_BASE_URL}/news"
    params = {
        "category": category,
        "token": api_key,
    }

    try:
        resp = await http_client.get(url, params=params)
        resp.raise_for_status()
        raw_items = resp.json()
        return [parse_finnhub_news(item) for item in raw_items]
    except httpx.HTTPStatusError as e:
        logger.error("Finnhub news HTTP error: %s", e)
        return []
    except Exception as e:
        logger.error("Finnhub news error: %s", e)
        return []


async def fetch_company_news(
    http_client: httpx.AsyncClient,
    api_key: str,
    symbol: str,
    from_date: str,
    to_date: str,
) -> list[dict[str, Any]]:
    """Fetch company-specific news from Finnhub."""
    if not api_key:
        logger.warning("No Finnhub API key configured")
        return []

    url = f"{FINNHUB_BASE_URL}/company-news"
    params = {
        "symbol": symbol,
        "from": from_date,
        "to": to_date,
        "token": api_key,
    }

    try:
        resp = await http_client.get(url, params=params)
        resp.raise_for_status()
        raw_items = resp.json()
        return [parse_finnhub_news(item) for item in raw_items]
    except httpx.HTTPStatusError as e:
        logger.error("Finnhub company news HTTP error: %s", e)
        return []
    except Exception as e:
        logger.error("Finnhub company news error: %s", e)
        return []
