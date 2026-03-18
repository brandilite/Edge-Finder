import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Build Polymarket Gamma API URL
  const params = new URLSearchParams();
  params.set('active', 'true');
  params.set('closed', 'false');
  params.set('limit', searchParams.get('limit') || '30');

  // Only fetch trending/popular events sorted by volume
  params.set('order', 'volume_24hr');
  params.set('ascending', 'false');

  const tag = searchParams.get('tag');
  if (tag) params.set('tag', tag);

  const title = searchParams.get('title');
  if (title) params.set('title', title);

  const slug = searchParams.get('slug');
  if (slug) params.set('slug', slug);

  try {
    const res = await fetch(`https://gamma-api.polymarket.com/events?${params.toString()}`, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 60 }, // Cache for 60 seconds
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Polymarket API error: ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('Polymarket proxy error:', err);
    return NextResponse.json({ error: 'Failed to fetch from Polymarket' }, { status: 500 });
  }
}
