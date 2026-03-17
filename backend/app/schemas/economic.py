from pydantic import BaseModel
from typing import Optional


class EconomicDataPoint(BaseModel):
    date: str
    value: float


class EconomicIndicator(BaseModel):
    series_id: str
    name: str
    country: str
    frequency: Optional[str] = None
    unit: Optional[str] = None
    latest_value: Optional[float] = None
    latest_date: Optional[str] = None
    history: list[EconomicDataPoint] = []


class MacroDashboard(BaseModel):
    country: str
    indicators: list[EconomicIndicator]
