from pydantic import BaseModel
from typing import Optional


class NewsItem(BaseModel):
    id: int
    headline: str
    summary: Optional[str] = None
    source: str
    url: Optional[str] = None
    image_url: Optional[str] = None
    published_at: Optional[str] = None
    category: Optional[str] = None
    related_symbols: Optional[list[str]] = None
    sentiment_score: Optional[float] = None
    sentiment_label: Optional[str] = None
    ai_summary: Optional[str] = None


class NewsResponse(BaseModel):
    count: int
    articles: list[NewsItem]
