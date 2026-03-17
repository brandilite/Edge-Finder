import uuid
from datetime import date, datetime
from typing import Optional

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class EconomicSeries(Base):
    __tablename__ = "economic_series"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    series_id: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    country: Mapped[str] = mapped_column(String(10), nullable=False)
    indicator_name: Mapped[str] = mapped_column(String(200), nullable=False)
    frequency: Mapped[Optional[str]] = mapped_column(String(20))
    unit: Mapped[Optional[str]] = mapped_column(String(50))
    last_updated: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    values = relationship("EconomicValue", back_populates="series", cascade="all, delete-orphan")


class EconomicValue(Base):
    __tablename__ = "economic_values"
    __table_args__ = (
        UniqueConstraint("series_id", "obs_date", name="uq_economic_values_series_date"),
        Index("ix_economic_values_series_date_desc", "series_id", "obs_date"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    series_id: Mapped[int] = mapped_column(Integer, ForeignKey("economic_series.id"), nullable=False)
    obs_date: Mapped[date] = mapped_column(Date, nullable=False)
    value: Mapped[float] = mapped_column(Float, nullable=False)

    series = relationship("EconomicSeries", back_populates="values")


class COTReport(Base):
    __tablename__ = "cot_reports"
    __table_args__ = (
        UniqueConstraint("report_date", "cftc_commodity_code", name="uq_cot_date_commodity"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    report_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    commodity_name: Mapped[str] = mapped_column(String(100), nullable=False)
    cftc_commodity_code: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    open_interest: Mapped[Optional[float]] = mapped_column(Float)
    noncomm_long: Mapped[Optional[float]] = mapped_column(Float)
    noncomm_short: Mapped[Optional[float]] = mapped_column(Float)
    noncomm_spread: Mapped[Optional[float]] = mapped_column(Float)
    comm_long: Mapped[Optional[float]] = mapped_column(Float)
    comm_short: Mapped[Optional[float]] = mapped_column(Float)
    nonrept_long: Mapped[Optional[float]] = mapped_column(Float)
    nonrept_short: Mapped[Optional[float]] = mapped_column(Float)
    change_oi: Mapped[Optional[float]] = mapped_column(Float)
    change_noncomm_long: Mapped[Optional[float]] = mapped_column(Float)
    change_noncomm_short: Mapped[Optional[float]] = mapped_column(Float)
    pct_oi_noncomm_long: Mapped[Optional[float]] = mapped_column(Float)
    pct_oi_noncomm_short: Mapped[Optional[float]] = mapped_column(Float)


class RetailSentiment(Base):
    __tablename__ = "retail_sentiment"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    symbol: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    fetched_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    pct_long: Mapped[Optional[float]] = mapped_column(Float)
    pct_short: Mapped[Optional[float]] = mapped_column(Float)
    volume_long: Mapped[Optional[float]] = mapped_column(Float)
    volume_short: Mapped[Optional[float]] = mapped_column(Float)
    source: Mapped[Optional[str]] = mapped_column(String(50))


class NewsArticle(Base):
    __tablename__ = "news_articles"
    __table_args__ = (
        UniqueConstraint("external_id", "source", name="uq_news_external_source"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    external_id: Mapped[str] = mapped_column(String(100), nullable=False)
    headline: Mapped[str] = mapped_column(String(500), nullable=False)
    summary: Mapped[Optional[str]] = mapped_column(Text)
    source: Mapped[str] = mapped_column(String(100), nullable=False)
    url: Mapped[Optional[str]] = mapped_column(String(1000))
    image_url: Mapped[Optional[str]] = mapped_column(String(1000))
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    category: Mapped[Optional[str]] = mapped_column(String(50))
    related_symbols: Mapped[Optional[dict]] = mapped_column(JSON)
    sentiment_score: Mapped[Optional[float]] = mapped_column(Float)
    sentiment_label: Mapped[Optional[str]] = mapped_column(String(20))
    ai_summary: Mapped[Optional[str]] = mapped_column(Text)
    fetched_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class ScorecardCache(Base):
    __tablename__ = "scorecard_cache"
    __table_args__ = (
        UniqueConstraint("symbol", "asset_class", name="uq_scorecard_symbol_class"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    symbol: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    asset_class: Mapped[str] = mapped_column(String(20), nullable=False)
    computed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    total_score: Mapped[float] = mapped_column(Float, nullable=False)
    technical_score: Mapped[Optional[float]] = mapped_column(Float)
    sentiment_score: Mapped[Optional[float]] = mapped_column(Float)
    cot_score: Mapped[Optional[float]] = mapped_column(Float)
    fundamental_score: Mapped[Optional[float]] = mapped_column(Float)
    seasonal_score: Mapped[Optional[float]] = mapped_column(Float)
    breakdown: Mapped[Optional[dict]] = mapped_column(JSON)
    direction: Mapped[Optional[str]] = mapped_column(String(10))


class SeasonalityMonthly(Base):
    __tablename__ = "seasonality_monthly"
    __table_args__ = (
        UniqueConstraint("symbol", "month", name="uq_seasonality_symbol_month"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    symbol: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    month: Mapped[int] = mapped_column(Integer, nullable=False)
    years_analyzed: Mapped[int] = mapped_column(Integer, nullable=False)
    avg_return: Mapped[float] = mapped_column(Float, nullable=False)
    median_return: Mapped[float] = mapped_column(Float, nullable=False)
    win_rate: Mapped[float] = mapped_column(Float, nullable=False)
    best_return: Mapped[float] = mapped_column(Float, nullable=False)
    worst_return: Mapped[float] = mapped_column(Float, nullable=False)
    computed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class LLMConversation(Base):
    __tablename__ = "llm_conversations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    context_symbol: Mapped[Optional[str]] = mapped_column(String(20))

    messages = relationship("LLMMessage", back_populates="conversation", cascade="all, delete-orphan")


class LLMMessage(Base):
    __tablename__ = "llm_messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    conversation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("llm_conversations.id"), nullable=False
    )
    role: Mapped[str] = mapped_column(String(20), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    conversation = relationship("LLMConversation", back_populates="messages")
