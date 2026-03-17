import logging

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger

logger = logging.getLogger(__name__)


def start_scheduler() -> BackgroundScheduler:
    """Configure and start the APScheduler with all background jobs."""
    scheduler = BackgroundScheduler()

    from app.tasks.cot_updater import run_cot_update
    from app.tasks.fred_updater import run_fred_update
    from app.tasks.sentiment_updater import run_sentiment_update
    from app.tasks.news_updater import run_news_update

    # COT update: every Saturday at 00:00 UTC
    scheduler.add_job(
        run_cot_update,
        CronTrigger(day_of_week="sat", hour=0, minute=0),
        id="cot_update",
        replace_existing=True,
        name="COT Weekly Update",
    )

    # FRED update: every 6 hours
    scheduler.add_job(
        run_fred_update,
        IntervalTrigger(hours=6),
        id="fred_update",
        replace_existing=True,
        name="FRED Economic Data Update",
    )

    # Sentiment update: every 15 minutes
    scheduler.add_job(
        run_sentiment_update,
        IntervalTrigger(minutes=15),
        id="sentiment_update",
        replace_existing=True,
        name="Retail Sentiment Update",
    )

    # News update: every 10 minutes
    scheduler.add_job(
        run_news_update,
        IntervalTrigger(minutes=10),
        id="news_update",
        replace_existing=True,
        name="Market News Update",
    )

    scheduler.start()
    logger.info("Scheduler started with %d jobs", len(scheduler.get_jobs()))
    return scheduler


def shutdown_scheduler(scheduler: BackgroundScheduler) -> None:
    """Gracefully shut down the scheduler."""
    if scheduler and scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("Scheduler shut down")
