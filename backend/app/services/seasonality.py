import logging
from collections import defaultdict
from statistics import median
from typing import Any

logger = logging.getLogger(__name__)


def compute_seasonality(prices: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """
    Compute monthly seasonality statistics from price history.

    Args:
        prices: list of {date, open, high, low, close, volume} sorted ascending by date

    Returns:
        list of 12 dicts (one per month) with:
        {month, avg_return, median_return, win_rate, best_return, worst_return, years}
    """
    if len(prices) < 30:
        logger.warning("Not enough price data for seasonality (%d bars)", len(prices))
        return []

    # Group prices by year-month and compute monthly returns
    monthly_closes: dict[tuple[int, int], list[float]] = defaultdict(list)

    for p in prices:
        date_str = p.get("date", "")
        close = p.get("close")
        if not date_str or close is None:
            continue
        try:
            parts = date_str.split("-")
            year = int(parts[0])
            month = int(parts[1])
            monthly_closes[(year, month)].append(float(close))
        except (ValueError, IndexError):
            continue

    # Compute monthly open/close for each year-month
    monthly_data: dict[tuple[int, int], dict[str, float]] = {}
    for (year, month), closes in monthly_closes.items():
        if closes:
            monthly_data[(year, month)] = {
                "open": closes[0],
                "close": closes[-1],
            }

    # Compute returns per month
    month_returns: dict[int, list[float]] = defaultdict(list)
    for (year, month), data in monthly_data.items():
        if data["open"] != 0:
            ret = ((data["close"] - data["open"]) / data["open"]) * 100.0
            month_returns[month].append(ret)

    results = []
    for month_num in range(1, 13):
        returns = month_returns.get(month_num, [])
        if not returns:
            results.append({
                "month": month_num,
                "avg_return": 0.0,
                "median_return": 0.0,
                "win_rate": 0.0,
                "best_return": 0.0,
                "worst_return": 0.0,
                "years": 0,
            })
            continue

        wins = sum(1 for r in returns if r > 0)
        results.append({
            "month": month_num,
            "avg_return": round(sum(returns) / len(returns), 4),
            "median_return": round(median(returns), 4),
            "win_rate": round((wins / len(returns)) * 100.0, 2),
            "best_return": round(max(returns), 4),
            "worst_return": round(min(returns), 4),
            "years": len(returns),
        })

    return results
