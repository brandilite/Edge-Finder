import logging
import uuid
from typing import Any, Optional

import anthropic

logger = logging.getLogger(__name__)


def create_analysis_prompt(symbol: Optional[str], context_data: Optional[dict[str, Any]]) -> str:
    """Build a system prompt that includes current market context."""
    base_prompt = (
        "You are EdgeFinder AI, an expert financial market analyst. "
        "You provide clear, data-driven analysis of forex, commodities, indices, and crypto markets. "
        "Always support your views with specific data points. "
        "Be concise but thorough. Use bullet points for key findings. "
        "Always include a risk disclaimer at the end of substantive analysis."
    )

    if not symbol and not context_data:
        return base_prompt

    context_parts = [base_prompt, "\n\n--- CURRENT MARKET CONTEXT ---"]

    if symbol:
        context_parts.append(f"\nSymbol under analysis: {symbol}")

    if context_data:
        if "scorecard" in context_data:
            sc = context_data["scorecard"]
            context_parts.append(
                f"\nScorecard: Total={sc.get('total_score', 'N/A')}, "
                f"Direction={sc.get('direction', 'N/A')}"
            )
            for key in ("technical", "sentiment", "cot", "fundamental", "seasonal"):
                sub = sc.get(key)
                if sub:
                    context_parts.append(
                        f"  {key.capitalize()}: {sub.get('value', 'N/A')} "
                        f"({sub.get('label', 'N/A')}) - {sub.get('details', '')}"
                    )

        if "ta" in context_data:
            ta = context_data["ta"]
            analysis = ta.get("analysis", {})
            rec = analysis.get("Recommend.All", "N/A")
            context_parts.append(f"\nTechnical Analysis: Overall Recommendation = {rec}")

        if "sentiment" in context_data:
            sent = context_data["sentiment"]
            context_parts.append(
                f"\nRetail Sentiment: {sent.get('pct_long', 'N/A')}% long / "
                f"{sent.get('pct_short', 'N/A')}% short"
            )

        if "cot" in context_data:
            cot = context_data["cot"]
            if cot:
                latest = cot[0] if isinstance(cot, list) else cot
                context_parts.append(
                    f"\nCOT Data: Spec Net={latest.get('noncomm_net', 'N/A')}, "
                    f"Comm Net={latest.get('comm_net', 'N/A')}"
                )

        if "macro" in context_data:
            context_parts.append("\nMacro data available for analysis")

    context_parts.append("\n--- END CONTEXT ---")

    return "\n".join(context_parts)


async def chat(
    api_key: str,
    messages: list[dict[str, str]],
    system_prompt: str,
) -> str:
    """Call Anthropic API with claude-sonnet-4-20250514."""
    if not api_key:
        return "Error: Anthropic API key not configured. Please set ANTHROPIC_API_KEY in your environment."

    client = anthropic.AsyncAnthropic(api_key=api_key)

    try:
        response = await client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=2048,
            system=system_prompt,
            messages=[
                {"role": m["role"], "content": m["content"]}
                for m in messages
            ],
        )

        if response.content:
            return response.content[0].text
        return "No response generated."

    except anthropic.APIConnectionError as e:
        logger.error("Anthropic API connection error: %s", e)
        return "Error: Unable to connect to the AI service. Please try again later."
    except anthropic.RateLimitError as e:
        logger.error("Anthropic API rate limit: %s", e)
        return "Error: AI service rate limit reached. Please wait a moment and try again."
    except anthropic.APIStatusError as e:
        logger.error("Anthropic API error: %s", e)
        return f"Error: AI service returned an error (status {e.status_code})."
    except Exception as e:
        logger.error("Unexpected LLM error: %s", e)
        return "Error: An unexpected error occurred with the AI service."


class LLMService:
    """Manages LLM conversations with message history."""

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.conversations: dict[str, list[dict[str, str]]] = {}

    def new_conversation(self) -> str:
        """Generate a new conversation ID."""
        return str(uuid.uuid4())

    def add_message(
        self, conversation_id: str, role: str, content: str
    ) -> list[dict[str, str]]:
        """Add a message to the conversation history."""
        if conversation_id not in self.conversations:
            self.conversations[conversation_id] = []
        self.conversations[conversation_id].append({"role": role, "content": content})
        return self.conversations[conversation_id]

    def get_messages(self, conversation_id: str) -> list[dict[str, str]]:
        """Get all messages for a conversation."""
        return self.conversations.get(conversation_id, [])

    async def get_response(
        self,
        conversation_id: str,
        system_prompt: str,
    ) -> str:
        """Get a response from the LLM given the conversation history."""
        messages = self.get_messages(conversation_id)
        response = await chat(self.api_key, messages, system_prompt)
        self.add_message(conversation_id, "assistant", response)
        return response
