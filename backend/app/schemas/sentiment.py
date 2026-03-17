from pydantic import BaseModel
from typing import Optional


class SentimentData(BaseModel):
    symbol: str
    pct_long: Optional[float] = None
    pct_short: Optional[float] = None
    source: Optional[str] = None
    fetched_at: Optional[str] = None


class SentimentResponse(BaseModel):
    symbols: list[SentimentData]
