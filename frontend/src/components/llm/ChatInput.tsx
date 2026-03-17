'use client';

import { useState, FormEvent } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled = false, isLoading = false, placeholder = 'Ask about markets...' }: ChatInputProps) {
  const isDisabled = disabled || isLoading;
  const [input, setInput] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isDisabled) return;
    onSend(trimmed);
    setInput('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 p-3 border-t border-dark-600 bg-dark-800"
    >
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder}
        disabled={isDisabled}
        className="flex-1 bg-dark-700 border border-dark-600 rounded-lg px-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-accent-blue/50 transition-colors disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={isDisabled || !input.trim()}
        className="p-2.5 bg-accent-blue rounded-lg text-white hover:bg-accent-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send size={18} />
      </button>
    </form>
  );
}

export default ChatInput;
