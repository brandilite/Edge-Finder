'use client';

import { useState, useCallback } from 'react';
import { apiPost } from '@/lib/api';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface LLMResponse {
  conversation_id: string;
  response: string;
}

export function useLLMChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(
    async (content: string, contextSymbol?: string) => {
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      try {
        const res = await apiPost<LLMResponse>('/llm/chat', {
          message: content,
          conversation_id: conversationId,
          context_symbol: contextSymbol,
        });

        setConversationId(res.conversation_id);

        const assistantMsg: ChatMessage = {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          content: res.response,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err) {
        const errorMsg: ChatMessage = {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `Error: ${err instanceof Error ? err.message : 'Failed to get response'}`,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [conversationId]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setConversationId(null);
  }, []);

  return { messages, sendMessage, isLoading, conversationId, clearChat };
}
