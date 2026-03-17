import logging
from datetime import datetime, timezone
from typing import Any, Optional

from app.schemas.scorecard import ScorecardResponse, SubScore

logger = logging.getLogger(__name__)

# Score weights
WEIGHTS = {
    "technical": 0.30,
    "sentiment": 0.20,
    "cot": 0.20,
    "fundamental": 0.20,
    "seasonal": 0.10,
}

# Currency pair -> (base_country, quote_country)
PAIR_COUNTRIES: dict[str, tuple[str, str]] = {
    "EURUSD": ("EU", "US"),
    "GBPUSD": ("UK", "US"),
    "USDJPY": ("US", "JP"),
    "AUDUSD": ("AU", "US"),
    "USDCAD": ("US", "CA"),
    "USDCHF": ("US", "EU"),
    "NZDUSD": ("AU", "US"),
    "EURGBP": ("EU", "UK"),
    "EURJPY": ("EU", "JP"),
    "GBPJPY": ("UK", "JP"),
}


def _technical_score(ta_data: Optional[dict[str, Any]]) -> SubScore:
    """
    Score based on TradingView technical analysis.
    Recommend.All ranges from -1 (strong sell) to +1 (strong buy).
    Maps to SubScore.value from -2 to +2.
    """
    if not ta_data:
        return SubScore(value=0.0, label="NEUTRAL", details="No technical data available")

    analysis = ta_data if "Recommend.All" in ta_data else ta_data.get("analysis", ta_data)
    recommend = analysis.get("Recommend.All")

    if recommend is None:
        return SubScore(value=0.0, label="NEUTRAL", details="No recommendation data")

    try:
        rec_val = float(recommend)
    except (ValueError, TypeError):
        return SubScore(value=0.0, label="NEUTRAL", details="Invalid technical data")

    # Scale: rec_val is -1..+1, we want -2..+2
    score = rec_val * 2.0
    score = max(-2.0, min(2.0, score))

    if score > 0.5:
        label = "BULLISH"
    elif score < -0.5:
        label = "BEARISH"
    else:
        label = "NEUTRAL"

    ma_rec = analysis.get("Recommend.MA", 0)
    osc_rec = analysis.get("Recommend.Other", 0)
    details = f"Overall: {rec_val:.3f}, Oscillators: {osc_rec}, MAs: {ma_rec}"

    return SubScore(value=round(score, 2), label=label, details=details)


def _sentiment_score(sentiment_data: Optional[dict[str, Any]]) -> SubScore:
    """
    Contrarian retail sentiment score.
    If retail >70% long -> bearish (-2)
    If retail <30% long -> bullish (+2)
    Linear interpolation between.
    """
    if not sentiment_data:
        return SubScore(value=0.0, label="NEUTRAL", details="No sentiment data available")

    pct_long = sentiment_data.get("pct_long")
    if pct_long is None:
        return SubScore(value=0.0, label="NEUTRAL", details="No percentage data")

    pct_long = float(pct_long)

    # Contrarian: high retail long = bearish signal
    # Map: 30% long -> +2 (bullish contrarian), 70% long -> -2 (bearish contrarian)
    if pct_long <= 30:
        score = 2.0
    elif pct_long >= 70:
        score = -2.0
    else:
        # Linear interpolation: 30->+2, 50->0, 70->-2
        score = 2.0 - ((pct_long - 30.0) / 40.0) * 4.0

    score = max(-2.0, min(2.0, score))

    if score > 0.5:
        label = "BULLISH"
    elif score < -0.5:
        label = "BEARISH"
    else:
        label = "NEUTRAL"

    pct_short = sentiment_data.get("pct_short", 100.0 - pct_long)
    details = f"Retail: {pct_long:.1f}% long / {pct_short:.1f}% short (contrarian)"

    return SubScore(value=round(score, 2), label=label, details=details)


def _cot_score(cot_data: Optional[list[dict[str, Any]]]) -> SubScore:
    """
    COT positioning score based on commercial vs speculator net positions.
    Compares current net positioning to recent history for direction and momentum.
    """
    if not cot_data or len(cot_data) == 0:
        return SubScore(value=0.0, label="NEUTRAL", details="No COT data available")

    latest = cot_data[0]
    noncomm_net = latest.get("noncomm_net")
    comm_net = latest.get("comm_net")

    if noncomm_net is None:
        return SubScore(value=0.0, label="NEUTRAL", details="Incomplete COT data")

    score = 0.0
    details_parts = []

    if len(cot_data) >= 4:
        recent_nets = [
            r.get("noncomm_net", 0) for r in cot_data[:4] if r.get("noncomm_net") is not None
        ]
        if recent_nets:
            avg_recent = sum(recent_nets) / len(recent_nets)
            if avg_recent != 0:
                change_pct = ((noncomm_net - avg_recent) / abs(avg_recent)) * 100
            else:
                change_pct = 0

            # Spec net increasing -> bullish (+2), decreasing -> bearish (-2)
            if change_pct > 20:
                score = 2.0
            elif change_pct > 10:
                score = 1.0
            elif change_pct < -20:
                score = -2.0
            elif change_pct < -10:
                score = -1.0
            else:
                score = change_pct / 10.0

            details_parts.append(f"Spec net change: {change_pct:.1f}%")
    else:
        if noncomm_net > 0:
            score = 1.0
        elif noncomm_net < 0:
            score = -1.0
        details_parts.append("Limited history")

    # Factor in commercial positioning (smart money)
    if comm_net is not None:
        if comm_net > 0 and score < 0:
            score *= 0.5
            details_parts.append("Commercials: net long (contrarian dampening)")
        elif comm_net < 0 and score > 0:
            score *= 0.5
            details_parts.append("Commercials: net short (contrarian dampening)")

    score = max(-2.0, min(2.0, score))

    if score > 0.5:
        label = "BULLISH"
    elif score < -0.5:
        label = "BEARISH"
    else:
        label = "NEUTRAL"

    details_parts.insert(0, f"Spec net: {noncomm_net:,.0f}")
    if comm_net is not None:
        details_parts.insert(1, f"Comm net: {comm_net:,.0f}")

    return SubScore(value=round(score, 2), label=label, details="; ".join(details_parts))


def _fundamental_score(
    macro_data: Optional[dict[str, Any]], asset_class: str, symbol: str = ""
) -> SubScore:
    """
    Fundamental score based on macro indicators.
    For forex: compare GDP growth, CPI trends, rate differentials.
    For others: use overall US macro health.
    """
    if not macro_data:
        return SubScore(value=0.0, label="NEUTRAL", details="No macro data available")

    score = 0.0
    details_parts = []

    if asset_class == "forex":
        countries = PAIR_COUNTRIES.get(symbol)
        if not countries:
            return SubScore(value=0.0, label="NEUTRAL", details=f"No country mapping for {symbol}")

        base_country, quote_country = countries
        base_data = macro_data.get(base_country, {})
        quote_data = macro_data.get(quote_country, {})

        # GDP growth differential
        base_gdp = _latest_value(base_data.get("GDP", []))
        quote_gdp = _latest_value(quote_data.get("GDP", []))
        if base_gdp is not None and quote_gdp is not None:
            gdp_diff = base_gdp - quote_gdp
            gdp_score = max(-0.5, min(0.5, gdp_diff / 5.0))
            score += gdp_score
            details_parts.append(f"GDP diff: {gdp_diff:.2f}")

        # Interest rate / CPI differential
        base_rate = _latest_value(base_data.get("FED_FUNDS", base_data.get("CPI", [])))
        quote_rate = _latest_value(quote_data.get("FED_FUNDS", quote_data.get("CPI", [])))
        if base_rate is not None and quote_rate is not None:
            rate_diff = base_rate - quote_rate
            rate_score = max(-0.75, min(0.75, rate_diff / 3.0))
            score += rate_score
            details_parts.append(f"Rate/CPI diff: {rate_diff:.2f}")

        # Unemployment differential (lower = stronger)
        base_unemp = _latest_value(base_data.get("UNEMPLOYMENT", []))
        quote_unemp = _latest_value(quote_data.get("UNEMPLOYMENT", []))
        if base_unemp is not None and quote_unemp is not None:
            unemp_diff = quote_unemp - base_unemp
            unemp_score = max(-0.75, min(0.75, unemp_diff / 5.0))
            score += unemp_score
            details_parts.append(f"Unemp diff: {unemp_diff:.2f}")

    else:
        # For indices, commodities, crypto: use US macro health
        us_data = macro_data.get("US", {})

        gdp = _latest_value(us_data.get("GDP", []))
        if gdp is not None:
            gdp_score = max(-0.5, min(0.5, (gdp - 20000) / 5000))
            score += gdp_score

        unemp = _latest_value(us_data.get("UNEMPLOYMENT", []))
        if unemp is not None:
            unemp_score = max(-0.5, min(0.5, (5.0 - unemp) / 3.0))
            score += unemp_score
            details_parts.append(f"US unemployment: {unemp:.1f}%")

        fed_funds = _latest_value(us_data.get("FED_FUNDS", []))
        if fed_funds is not None:
            details_parts.append(f"Fed funds: {fed_funds:.2f}%")

    score = max(-2.0, min(2.0, score))

    if score > 0.5:
        label = "BULLISH"
    elif score < -0.5:
        label = "BEARISH"
    else:
        label = "NEUTRAL"

    return SubScore(
        value=round(score, 2),
        label=label,
        details="; ".join(details_parts) if details_parts else "Macro analysis applied",
    )


def _seasonal_score(
    seasonal_data: Optional[list[dict[str, Any]]], current_month: int = 0
) -> SubScore:
    """
    Seasonal score based on historical monthly win rate and average return.
    """
    if not seasonal_data:
        return SubScore(value=0.0, label="NEUTRAL", details="No seasonal data available")

    if current_month == 0:
        current_month = datetime.now(timezone.utc).month

    current = None
    for s in seasonal_data:
        if s.get("month") == current_month:
            current = s
            break

    if not current:
        return SubScore(value=0.0, label="NEUTRAL", details=f"No data for month {current_month}")

    win_rate = current.get("win_rate", 50.0)
    avg_return = current.get("avg_return", 0.0)
    years = current.get("years", 0)

    if years < 3:
        return SubScore(value=0.0, label="NEUTRAL", details=f"Insufficient years ({years})")

    # Win rate component: 75%+ -> +1, 25%- -> -1
    wr_score = (win_rate - 50.0) / 25.0

    # Average return component
    ret_score = max(-1.0, min(1.0, avg_return / 2.0))

    score = wr_score + ret_score
    score = max(-2.0, min(2.0, score))

    if score > 0.5:
        label = "BULLISH"
    elif score < -0.5:
        label = "BEARISH"
    else:
        label = "NEUTRAL"

    details = (
        f"Month {current_month}: {win_rate:.0f}% win rate, "
        f"{avg_return:.2f}% avg return ({years} years)"
    )

    return SubScore(value=round(score, 2), label=label, details=details)


def _latest_value(data_points: list[dict[str, Any]]) -> Optional[float]:
    """Get the most recent value from a list of {date, value} dicts."""
    if not data_points:
        return None
    for dp in data_points:
        val = dp.get("value")
        if val is not None:
            try:
                return float(val)
            except (ValueError, TypeError):
                continue
    return None


def compute_scorecard(
    symbol: str,
    asset_class: str,
    ta_data: Optional[dict[str, Any]] = None,
    sentiment_data: Optional[dict[str, Any]] = None,
    cot_data: Optional[list[dict[str, Any]]] = None,
    macro_data: Optional[dict[str, Any]] = None,
    seasonal_data: Optional[list[dict[str, Any]]] = None,
) -> ScorecardResponse:
    """
    Compute the composite scorecard for a symbol.
    Total score ranges from -10 to +10.
    """
    tech = _technical_score(ta_data)
    sent = _sentiment_score(sentiment_data)
    cot = _cot_score(cot_data)
    fund = _fundamental_score(macro_data, asset_class, symbol)
    seas = _seasonal_score(seasonal_data)

    # Weighted total: each subscore is -2..+2, multiply by weight and scale by 5
    total = (
        WEIGHTS["technical"] * tech.value * 5.0
        + WEIGHTS["sentiment"] * sent.value * 5.0
        + WEIGHTS["cot"] * cot.value * 5.0
        + WEIGHTS["fundamental"] * fund.value * 5.0
        + WEIGHTS["seasonal"] * seas.value * 5.0
    )
    total = max(-10.0, min(10.0, round(total, 2)))

    if total > 2.0:
        direction = "BULLISH"
    elif total < -2.0:
        direction = "BEARISH"
    else:
        direction = "NEUTRAL"

    return ScorecardResponse(
        symbol=symbol,
        asset_class=asset_class,
        total_score=total,
        direction=direction,
        technical=tech,
        sentiment=sent,
        cot=cot,
        fundamental=fund,
        seasonal=seas,
        computed_at=datetime.now(timezone.utc).isoformat(),
    )
