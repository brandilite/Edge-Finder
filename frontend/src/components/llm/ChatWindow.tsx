'use client';

import { useRef, useEffect } from 'react';
import { Bot, User } from 'lucide-react';
import { ChatMessage } from '@/hooks/useLLMChat';
import clsx from 'clsx';

interface ChatWindowProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-dark-600 px-1 py-0.5 rounded text-accent-cyan text-xs">$1</code>')
    .replace(/\n/g, '<br />');
}

export function ChatWindow({ messages, isLoading }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <Bot size={48} className="mx-auto mb-3 text-gray-600" />
          <p className="text-sm">Ask the AI anything about markets and trading.</p>
          <p className="text-xs text-gray-600 mt-1">
            Select a symbol for context-aware analysis.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={clsx(
            'flex gap-3',
            msg.role === 'user' ? 'justify-end' : 'justify-start'
          )}
        >
          {msg.role === 'assistant' && (
            <div className="w-7 h-7 rounded-full bg-accent-blue/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Bot size={14} className="text-accent-blue" />
            </div>
          )}
          <div
            className={clsx(
              'max-w-[80%] rounded-lg px-4 py-2.5 text-sm leading-relaxed',
              msg.role === 'user'
                ? 'bg-accent-blue text-white'
                : 'bg-dark-700 text-gray-200'
            )}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
          />
          {msg.role === 'user' && (
            <div className="w-7 h-7 rounded-full bg-dark-600 flex items-center justify-center flex-shrink-0 mt-0.5">
              <User size={14} className="text-gray-400" />
            </div>
          )}
        </div>
      ))}

      {isLoading && (
        <div className="flex gap-3">
          <div className="w-7 h-7 rounded-full bg-accent-blue/20 flex items-center justify-center flex-shrink-0">
            <Bot size={14} className="text-accent-blue" />
          </div>
          <div className="bg-dark-700 rounded-lg px-4 py-3">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}

export default ChatWindow;
