from pydantic import BaseModel
from typing import Optional


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    context_symbol: Optional[str] = None


class ChatResponse(BaseModel):
    conversation_id: str
    response: str
    context_used: Optional[dict] = None
