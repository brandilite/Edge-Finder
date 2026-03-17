from pydantic import BaseModel
from typing import Optional


class SubScore(BaseModel):
    value: float
    label: str
    details: Optional[str] = None


class ScorecardResponse(BaseModel):
    symbol: str
    asset_class: str
    total_score: float
    direction: str
    technical: SubScore
    sentiment: SubScore
    cot: SubScore
    fundamental: SubScore
    seasonal: SubScore
    computed_at: str


class ScorecardListResponse(BaseModel):
    asset_class: str
    scorecards: list[ScorecardResponse]
