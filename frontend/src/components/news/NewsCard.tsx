'use client';

import { useState } from 'react';
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import clsx from 'clsx';

interface NewsItem {
  id?: string;
  headline: string;
  source: string;
  time: string;
  summary?: string;
  url?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  category?: string;
}

interface NewsCardProps {
  article: NewsItem;
}

export function NewsCard({ article }: NewsCardProps) {
  const [expanded, setExpanded] = useState(false);

  const sentimentColor = {
    positive: 'bg-accent-green/15 text-accent-green',
    negative: 'bg-accent-red/15 text-accent-red',
    neutral: 'bg-accent-yellow/15 text-accent-yellow',
  };

  return (
    <div className="bg-dark-800 border border-dark-600 rounded-lg p-4 hover:border-dark-600/80 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-200 leading-snug">
            {article.headline}
          </h3>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xs text-gray-500">{article.source}</span>
            <span className="text-xs text-gray-600">|</span>
            <span className="text-xs text-gray-500">{article.time}</span>
            {article.sentiment && (
              <span
                className={clsx(
                  'text-[10px] font-medium px-1.5 py-0.5 rounded-full',
                  sentimentColor[article.sentiment]
                )}
              >
                {article.sentiment}
              </span>
            )}
            {article.category && (
              <span className="text-[10px] text-gray-500 bg-dark-700 px-1.5 py-0.5 rounded">
                {article.category}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {article.summary && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 text-gray-500 hover:text-gray-300 transition-colors"
            >
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
          {article.url && (
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 text-gray-500 hover:text-accent-blue transition-colors"
            >
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>

      {expanded && article.summary && (
        <p className="text-xs text-gray-400 mt-3 leading-relaxed border-t border-dark-700 pt-3">
          {article.summary}
        </p>
      )}
    </div>
  );
}

export default NewsCard;
