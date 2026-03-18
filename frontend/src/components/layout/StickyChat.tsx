'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUp, Paperclip } from 'lucide-react';
import clsx from 'clsx';

export default function StickyChat() {
  const [input, setInput] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      // Navigate to analysis page with query
      router.push(`/analysis?q=${encodeURIComponent(input.trim())}`);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="fixed bottom-0 right-0 z-30 pointer-events-none" style={{ left: 'var(--sidebar-width, 240px)' }}>
      <div className="pointer-events-auto">
        {/* Gradient fade above the input */}
        <div className="h-8 bg-gradient-to-t from-[#0f1419] to-transparent" />

        <div className="bg-[#0f1419] px-4 pb-4">
          <form
            onSubmit={handleSubmit}
            className="max-w-3xl mx-auto flex items-center gap-2 bg-[#1a1f2e] border border-[#2a2f3a] rounded-xl px-4 py-2.5 chat-backdrop hover:border-[#3a4050] transition-colors"
          >
            <button
              type="button"
              className="p-1 text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0"
            >
              <Paperclip size={16} />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about markets..."
              className="flex-1 bg-transparent text-sm text-gray-200 placeholder-gray-500 outline-none min-w-0"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className={clsx(
                'p-1.5 rounded-lg transition-colors flex-shrink-0',
                input.trim()
                  ? 'bg-blue-500 text-white hover:bg-blue-400'
                  : 'bg-[#2a2f3a] text-gray-500'
              )}
            >
              <ArrowUp size={14} />
            </button>
          </form>
          <p className="text-center text-[10px] text-gray-600 mt-2">
            AI-powered analysis. Verify important information independently.
          </p>
        </div>
      </div>
    </div>
  );
}

