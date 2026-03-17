import asyncio
import logging
from datetime import date

import httpx
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert

from app.db.engine import async_session_factory
from app.db.models import COTReport
from app.services.cot import SYMBOL_TO_CFTC, fetch_cot_data

logger = logging.getLogger(__name__)


def run_cot_update():
    """Entry point for the scheduler (sync). Runs the async update."""
    asyncio.run(_async_cot_update())


async def _async_cot_update():
    """Fetch latest COT data from CFTC and upsert into the database."""
    logger.info("Starting COT update...")
    inserted = 0
    errors = 0

    async with httpx.AsyncClient(timeout=30.0) as http:
        for symbol, code in SYMBOL_TO_CFTC.items():
            try:
                records = await fetch_cot_data(http, commodity_code=code, limit=4)
                logger.info("COT: fetched %d records for %s", len(records), symbol)

                async with async_session_factory() as session:
                    for record in records:
                        report_date_str = record.get("report_date", "")
                        if not report_date_str:
                            continue

                        try:
                            report_dt = date.fromisoformat(report_date_str[:10])
                        except ValueError:
                            continue

                        stmt = pg_insert(COTReport).values(
                            report_date=report_dt,
                            commodity_name=record.get("commodity_name", ""),
                            cftc_commodity_code=code,
                            open_interest=record.get("open_interest"),
                            noncomm_long=record.get("noncomm_long"),
                            noncomm_short=record.get("noncomm_short"),
                            noncomm_spread=None,
                            comm_long=record.get("comm_long"),
                            comm_short=record.get("comm_short"),
                            nonrept_long=None,
                            nonrept_short=None,
                            change_oi=None,
                            change_noncomm_long=None,
                            change_noncomm_short=None,
                            pct_oi_noncomm_long=record.get("pct_noncomm_long"),
                            pct_oi_noncomm_short=record.get("pct_noncomm_short"),
                        ).on_conflict_do_update(
                            constraint="uq_cot_date_commodity",
                            set_={
                                "open_interest": record.get("open_interest"),
                                "noncomm_long": record.get("noncomm_long"),
                                "noncomm_short": record.get("noncomm_short"),
                                "comm_long": record.get("comm_long"),
                                "comm_short": record.get("comm_short"),
                                "pct_oi_noncomm_long": record.get("pct_noncomm_long"),
                                "pct_oi_noncomm_short": record.get("pct_noncomm_short"),
                            },
                        )
                        await session.execute(stmt)
                        inserted += 1

                    await session.commit()

            except Exception as e:
                logger.error("COT update error for %s: %s", symbol, e)
                errors += 1

    logger.info(
        "COT update complete: %d records upserted, %d errors",
        inserted, errors,
    )
