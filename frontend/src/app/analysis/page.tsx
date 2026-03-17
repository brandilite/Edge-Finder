'use client';

import { useState } from 'react';
import { FOREX_SYMBOLS, COMMODITY_SYMBOLS, INDEX_SYMBOLS, CRYPTO_SYMBOLS } from '@/lib/constants';
import { useLLMChat } from '@/hooks/useLLMChat';
import { ChatWindow } from '@/components/llm/ChatWindow';
import { ChatInput } from '@/components/llm/ChatInput';
import { Bot } from 'lucide-react';

const ALL_SYMBOLS = ['', ...FOREX_SYMBOLS, ...COMMODITY_SYMBOLS, ...INDEX_SYMBOLS, ...CRYPTO_SYMBOLS];

export default function AnalysisPage() {
  const [contextSymbol, setContextSymbol] = useState('');
  const { messages, sendMessage, isLoading, conversationId } = useLLMChat();

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Bot className="text-accent-cyan" size={28} />
          <div>
            <h1 className="text-2xl font-bold">AI Analysis</h1>
            <p className="text-sm text-gray-400">Powered by Claude — ask about any market, setup, or analysis</p>
          </div>
        </div>

        <select
          value={contextSymbol}
          onChange={(e) => setContextSymbol(e.target.value)}
          className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white"
        >
          <option value="">No symbol context</option>
          {ALL_SYMBOLS.filter(Boolean).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="flex-1 bg-dark-800 rounded-lg overflow-hidden flex flex-col">
        <ChatWindow messages={messages} isLoading={isLoading} />
        <ChatInput
          onSend={(msg) => sendMessage(msg, contextSymbol || undefined)}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
