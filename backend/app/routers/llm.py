import logging
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.config import get_settings
from app.deps import get_db, get_http_client, get_redis
from app.db.models import LLMConversation, LLMMessage
from app.schemas.llm import ChatMessage, ChatRequest, ChatResponse
from app.services.cache import cache_get
from app.services.llm import LLMService, create_analysis_prompt

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/llm", tags=["llm"])


async def _build_context(symbol: Optional[str], redis) -> dict:
    """Build context data from cached scorecard and market data."""
    context: dict = {}
    if not symbol:
        return context

    # Try to get cached scorecard from any asset class
    for asset_class in ["forex", "crypto", "commodities", "indices"]:
        cached = await cache_get(redis, f"scorecard:{asset_class}:{symbol}")
        if cached:
            context["scorecard"] = cached
            break

    # Try to get cached technical data
    ta_cached = await cache_get(redis, f"technical:{symbol}")
    if ta_cached:
        context["ta"] = ta_cached

    # Try to get cached sentiment
    sent_cached = await cache_get(redis, f"sentiment:{symbol}")
    if sent_cached:
        context["sentiment"] = sent_cached

    return context


@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db),
    redis=Depends(get_redis),
):
    """Send a message and get an AI analysis response."""
    settings = get_settings()
    llm_service = LLMService(api_key=settings.ANTHROPIC_API_KEY)

    conversation_id = request.conversation_id
    is_new = False

    if conversation_id:
        # Load existing conversation
        try:
            conv_uuid = uuid.UUID(conversation_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid conversation ID format")

        stmt = (
            select(LLMConversation)
            .where(LLMConversation.id == conv_uuid)
            .options(selectinload(LLMConversation.messages))
        )
        result = await db.execute(stmt)
        conversation = result.scalar_one_or_none()

        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")

        # Load existing messages into LLM service
        for msg in sorted(conversation.messages, key=lambda m: m.created_at):
            llm_service.add_message(conversation_id, msg.role, msg.content)

    else:
        # Create new conversation
        conversation_id = llm_service.new_conversation()
        is_new = True
        conversation = LLMConversation(
            id=uuid.UUID(conversation_id),
            context_symbol=request.context_symbol,
        )
        db.add(conversation)

    # Build context from cached data
    context_data = await _build_context(request.context_symbol, redis)

    # Create system prompt with context
    system_prompt = create_analysis_prompt(request.context_symbol, context_data)

    # Add user message
    llm_service.add_message(conversation_id, "user", request.message)

    # Save user message to DB
    user_msg = LLMMessage(
        conversation_id=uuid.UUID(conversation_id),
        role="user",
        content=request.message,
    )
    db.add(user_msg)

    # Get AI response
    response_text = await llm_service.get_response(conversation_id, system_prompt)

    # Save assistant message to DB
    assistant_msg = LLMMessage(
        conversation_id=uuid.UUID(conversation_id),
        role="assistant",
        content=response_text,
    )
    db.add(assistant_msg)

    await db.flush()

    return ChatResponse(
        conversation_id=conversation_id,
        response=response_text,
        context_used=context_data if context_data else None,
    )


@router.get("/conversations/{conversation_id}")
async def get_conversation(
    conversation_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get conversation history by ID."""
    try:
        conv_uuid = uuid.UUID(conversation_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid conversation ID format")

    stmt = (
        select(LLMConversation)
        .where(LLMConversation.id == conv_uuid)
        .options(selectinload(LLMConversation.messages))
    )
    result = await db.execute(stmt)
    conversation = result.scalar_one_or_none()

    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    messages = [
        ChatMessage(role=msg.role, content=msg.content)
        for msg in sorted(conversation.messages, key=lambda m: m.created_at)
    ]

    return {
        "conversation_id": str(conversation.id),
        "context_symbol": conversation.context_symbol,
        "created_at": conversation.created_at.isoformat() if conversation.created_at else None,
        "messages": [m.model_dump() for m in messages],
    }
