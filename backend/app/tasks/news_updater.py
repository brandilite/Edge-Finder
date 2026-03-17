import asyncio
import logging
from datetime import datetime, timezone

import httpx
from sqlalchemy.dialects.postgresql import insert as pg_insert

from app.config import get_settings
from app.db.engine import async_session_factory
from app.db.models import NewsArticle
from app.services.news import fetch_market_news

logger = logging.getLogger(__name__)


def run_news_update():
    """Entry point for the scheduler (sync). Runs the async update."""
    asyncio.run(_async_news_update())


async def _async_news_update():
    """Fetch latest Finnhub news, upsert into DB, with basic sentiment scoring."""
    settings = get_settings()

    if not settings.FINNHUB_API_KEY:
        logger.warning("FINNHUB_API_KEY not set, skipping news update")
        return

    logger.info("Starting news update...")
    inserted = 0
    errors = 0

    async with httpx.AsyncClient(timeout=30.0) as http:
        for category in ["general", "forex", "crypto"]:
            try:
                articles = await fetch_market_news(
                    http, settings.FINNHUB_API_KEY, category=category
                )
                logger.info(
                    "News: fetched %d articles for category '%s'",
                    len(articles), category,
                )

                if not articles:
                    continue

                async with async_session_factory() as session:
                    for article in articles:
                        external_id = article.get("external_id", "")
                        if not external_id:
                            continue

                        source = article.get("source", "finnhub")

                        # Parse published_at
                        published_at = None
                        if article.get("published_at"):
                            try:
                                published_at = datetime.fromisoformat(
                                    article["published_at"].replace("Z", "+00:00")
                                )
                            except (ValueError, AttributeError):
                                pass

                        stmt = pg_insert(NewsArticle).values(
                            external_id=external_id,
                            headline=article.get("headline", "")[:500],
                            summary=article.get("summary"),
                            source=source,
                            url=article.get("url"),
                            image_url=article.get("image_url"),
                            published_at=published_at,
                            category=category,
                            related_symbols=article.get("related_symbols"),
                            sentiment_score=article.get("sentiment_score"),
                            sentiment_label=article.get("sentiment_label"),
                            ai_summary=article.get("ai_summary"),
                            fetched_at=datetime.now(timezone.utc),
                        ).on_conflict_do_update(
                            constraint="uq_news_external_source",
                            set_={
                                "headline": article.get("headline", "")[:500],
                                "summary": article.get("summary"),
                                "sentiment_score": article.get("sentiment_score"),
                                "sentiment_label": article.get("sentiment_label"),
                                "fetched_at": datetime.now(timezone.utc),
                            },
                        )
                        await session.execute(stmt)
                        inserted += 1

                    await session.commit()

            except Exception as e:
                logger.error("News update error for category '%s': %s", category, e)
                errors += 1

    logger.info(
        "News update complete: %d articles upserted, %d errors",
        inserted, errors,
    )
