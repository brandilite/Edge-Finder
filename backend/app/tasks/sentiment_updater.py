import asyncio
import logging
from datetime import datetime, timezone

import httpx

from app.db.engine import async_session_factory
from app.db.models import RetailSentiment
from app.services.sentiment import fetch_myfxbook_outlook

logger = logging.getLogger(__name__)


def run_sentiment_update():
    """Entry point for the scheduler (sync). Runs the async update."""
    asyncio.run(_async_sentiment_update())


async def _async_sentiment_update():
    """Fetch Myfxbook sentiment data and store a snapshot in the database."""
    logger.info("Starting sentiment update...")

    async with httpx.AsyncClient(timeout=30.0) as http:
        try:
            data = await fetch_myfxbook_outlook(http)
            logger.info("Sentiment: fetched %d symbols", len(data))

            if not data:
                logger.warning("No sentiment data received")
                return

            now = datetime.now(timezone.utc)

            async with async_session_factory() as session:
                for item in data:
                    sentiment = RetailSentiment(
                        symbol=item.get("symbol", ""),
                        fetched_at=now,
                        pct_long=item.get("pct_long"),
                        pct_short=item.get("pct_short"),
                        volume_long=None,
                        volume_short=None,
                        source=item.get("source", "myfxbook"),
                    )
                    session.add(sentiment)

                await session.commit()
                logger.info("Sentiment: stored %d records in DB", len(data))

        except Exception as e:
            logger.error("Sentiment update error: %s", e)

    logger.info("Sentiment update complete")
