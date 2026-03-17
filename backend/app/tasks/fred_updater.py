import asyncio
import logging
from datetime import date, datetime, timezone

import httpx
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert

from app.config import get_settings
from app.db.engine import async_session_factory
from app.db.models import EconomicSeries, EconomicValue
from app.services.fred import FRED_SERIES, fetch_series

logger = logging.getLogger(__name__)


def run_fred_update():
    """Entry point for the scheduler (sync). Runs the async update."""
    asyncio.run(_async_fred_update())


async def _async_fred_update():
    """Fetch latest FRED data for all tracked series and upsert into DB."""
    settings = get_settings()

    if not settings.FRED_API_KEY:
        logger.warning("FRED_API_KEY not set, skipping update")
        return

    logger.info("Starting FRED update...")
    total_values = 0
    errors = 0

    async with httpx.AsyncClient(timeout=30.0) as http:
        for country, indicators in FRED_SERIES.items():
            for indicator_name, series_id in indicators.items():
                try:
                    data = await fetch_series(
                        http, settings.FRED_API_KEY, series_id, limit=10
                    )
                    if not data:
                        continue

                    async with async_session_factory() as session:
                        # Ensure the series exists in the series table
                        result = await session.execute(
                            select(EconomicSeries).where(
                                EconomicSeries.series_id == series_id
                            )
                        )
                        series_row = result.scalar_one_or_none()

                        if not series_row:
                            series_row = EconomicSeries(
                                series_id=series_id,
                                country=country,
                                indicator_name=indicator_name,
                                last_updated=datetime.now(timezone.utc),
                            )
                            session.add(series_row)
                            await session.flush()
                        else:
                            series_row.last_updated = datetime.now(timezone.utc)

                        # Upsert values
                        for dp in data:
                            try:
                                obs_date = date.fromisoformat(dp["date"])
                            except (ValueError, KeyError):
                                continue

                            stmt = pg_insert(EconomicValue).values(
                                series_id=series_row.id,
                                obs_date=obs_date,
                                value=dp["value"],
                            ).on_conflict_do_update(
                                constraint="uq_economic_values_series_date",
                                set_={"value": dp["value"]},
                            )
                            await session.execute(stmt)
                            total_values += 1

                        await session.commit()

                    logger.info(
                        "FRED: updated %d values for %s/%s (%s)",
                        len(data), country, indicator_name, series_id,
                    )

                except Exception as e:
                    logger.error(
                        "FRED update error for %s/%s (%s): %s",
                        country, indicator_name, series_id, e,
                    )
                    errors += 1

    logger.info(
        "FRED update complete: %d values upserted, %d errors",
        total_values, errors,
    )
