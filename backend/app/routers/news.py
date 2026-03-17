import logging

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query

from app.config import get_settings
from app.deps import get_http_client, get_redis
from app.schemas.news import NewsItem, NewsResponse
from app.services.cache import cache_get, cache_set
from app.services.news import fetch_market_news

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/news", tags=["news"])


@router.get("", response_model=NewsResponse)
async def get_latest_news(
    limit: int = Query(default=50, ge=1, le=200),
    http_client: httpx.AsyncClient = Depends(get_http_client),
    redis=Depends(get_redis),
):
    """Get latest market news."""
    cache_key = f"news:general:{limit}"
    cached = await cache_get(redis, cache_key)
    if cached:
        return NewsResponse(**cached)

    settings = get_settings()
    raw_articles = await fetch_market_news(http_client, settings.FINNHUB_API_KEY, category="general")

    articles = []
    for i, item in enumerate(raw_articles[:limit]):
        articles.append(NewsItem(
            id=i + 1,
            headline=item.get("headline", ""),
            summary=item.get("summary"),
            source=item.get("source", ""),
            url=item.get("url"),
            image_url=item.get("image_url"),
            published_at=item.get("published_at"),
            category=item.get("category"),
            related_symbols=item.get("related_symbols"),
            sentiment_score=item.get("sentiment_score"),
            sentiment_label=item.get("sentiment_label"),
            ai_summary=item.get("ai_summary"),
        ))

    response = NewsResponse(count=len(articles), articles=articles)
    await cache_set(redis, cache_key, response.model_dump(), ttl=600)
    return response


@router.get("/{category}", response_model=NewsResponse)
async def get_category_news(
    category: str,
    limit: int = Query(default=50, ge=1, le=200),
    http_client: httpx.AsyncClient = Depends(get_http_client),
    redis=Depends(get_redis),
):
    """Get news by category (general, forex, crypto, merger)."""
    valid_categories = ["general", "forex", "crypto", "merger"]
    if category not in valid_categories:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid category: {category}. Must be one of: {valid_categories}",
        )

    cache_key = f"news:{category}:{limit}"
    cached = await cache_get(redis, cache_key)
    if cached:
        return NewsResponse(**cached)

    settings = get_settings()
    raw_articles = await fetch_market_news(http_client, settings.FINNHUB_API_KEY, category=category)

    articles = []
    for i, item in enumerate(raw_articles[:limit]):
        articles.append(NewsItem(
            id=i + 1,
            headline=item.get("headline", ""),
            summary=item.get("summary"),
            source=item.get("source", ""),
            url=item.get("url"),
            image_url=item.get("image_url"),
            published_at=item.get("published_at"),
            category=item.get("category"),
            related_symbols=item.get("related_symbols"),
            sentiment_score=item.get("sentiment_score"),
            sentiment_label=item.get("sentiment_label"),
            ai_summary=item.get("ai_summary"),
        ))

    response = NewsResponse(count=len(articles), articles=articles)
    await cache_set(redis, cache_key, response.model_dump(), ttl=600)
    return response
