'use client';

import { useState } from 'react';
import { useLLMChat } from '@/hooks/useLLMChat';
import { ChatWindow } from '@/components/llm/ChatWindow';
import { ChatInput } from '@/components/llm/ChatInput';
import AdvancedChart from '@/components/tv/AdvancedChart';
import TechnicalAnalysis from '@/components/tv/TechnicalAnalysis';
import { Bot } from 'lucide-react';

const SYMBOLS = [
  { tv: 'FX:EURUSD', label: 'EUR/USD' },
  { tv: 'FX:GBPUSD', label: 'GBP/USD' },
  { tv: 'FX:USDJPY', label: 'USD/JPY' },
  { tv: 'OANDA:XAUUSD', label: 'Gold' },
  { tv: 'BITSTAMP:BTCUSD', label: 'Bitcoin' },
  { tv: 'FOREXCOM:SPXUSD', label: 'S&P 500' },
  { tv: 'TVC:USOIL', label: 'Crude Oil' },
];

export default function AnalysisPage() {
  const [contextSymbol, setContextSymbol] = useState(SYMBOLS[0].tv);
  const { messages, sendMessage, isLoading, clearChat } = useLLMChat();

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bot className="text-cyan-400" size={24} />
          <div>
            <h1 className="text-lg font-semibold text-gray-100">AI Analysis</h1>
            <p className="text-sm text-gray-500">Ask Claude about any market, setup, or technical analysis</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={contextSymbol}
            onChange={(e) => setContextSymbol(e.target.value)}
            className="bg-[#1f2937] border border-[#2a2f3a] rounded-lg px-3 py-2 text-sm text-white"
          >
            {SYMBOLS.map((s) => (
              <option key={s.tv} value={s.tv}>{s.label}</option>
            ))}
          </select>
          <button
            onClick={clearChat}
            className="px-3 py-2 text-sm bg-[#1f2937] text-gray-400 hover:text-white rounded-lg border border-[#2a2f3a] transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart + Technical sidebar */}
        <div className="lg:col-span-2 space-y-4">
          <AdvancedChart symbol={contextSymbol} height={400} />
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-[#2a2f3a] overflow-hidden bg-[#1a1f2e]">
              <TechnicalAnalysis symbol={contextSymbol} interval="1m" height={250} />
            </div>
            <div className="rounded-lg border border-[#2a2f3a] overflow-hidden bg-[#1a1f2e]">
              <TechnicalAnalysis symbol={contextSymbol} interval="1h" height={250} />
            </div>
            <div className="rounded-lg border border-[#2a2f3a] overflow-hidden bg-[#1a1f2e]">
              <TechnicalAnalysis symbol={contextSymbol} interval="1D" height={250} />
            </div>
          </div>
        </div>

        {/* Chat */}
        <div className="flex flex-col bg-[#1a1f2e] rounded-lg border border-[#2a2f3a] overflow-hidden" style={{ height: 'calc(100vh - 160px)' }}>
          <div className="px-4 py-3 border-b border-[#2a2f3a] bg-[#1f2937]">
            <span className="text-sm font-semibold text-gray-300">Chat with AI</span>
          </div>
          <div className="flex-1 overflow-hidden flex flex-col">
            <ChatWindow messages={messages} isLoading={isLoading} />
            <ChatInput
              onSend={(msg) => sendMessage(msg, contextSymbol || undefined)}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
