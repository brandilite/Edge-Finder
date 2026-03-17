from pydantic import BaseModel
from typing import Optional


class COTData(BaseModel):
    report_date: str
    commodity_name: str
    cftc_code: str
    open_interest: Optional[float] = None
    noncomm_long: Optional[float] = None
    noncomm_short: Optional[float] = None
    noncomm_net: Optional[float] = None
    comm_long: Optional[float] = None
    comm_short: Optional[float] = None
    comm_net: Optional[float] = None
    pct_noncomm_long: Optional[float] = None
    pct_noncomm_short: Optional[float] = None


class COTResponse(BaseModel):
    symbol: str
    latest: Optional[COTData] = None
    history: list[COTData] = []
