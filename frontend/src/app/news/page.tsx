'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { NewsCard } from '@/components/news/NewsCard';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

const CATEGORIES = ['general', 'forex', 'crypto', 'merger'];

export default function NewsPage() {
  const [category, setCategory] = useState('general');

  const { data, isLoading } = useQuery({
    queryKey: ['news', category],
    queryFn: () => apiGet<any>(`/news/${category}`),
  });

  const articles = data?.articles || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">News Feed</h1>

      <div className="flex gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              category === cat
                ? 'bg-accent-blue text-white'
                : 'bg-dark-700 text-gray-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : articles.length === 0 ? (
        <div className="text-gray-400 text-center py-12">No articles found for this category.</div>
      ) : (
        <div className="grid gap-4">
          {articles.map((article: any, i: number) => (
            <NewsCard key={article.external_id || i} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
