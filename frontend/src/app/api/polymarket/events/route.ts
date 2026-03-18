import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Build Polymarket Gamma API URL
  // Note: Gamma API does NOT support order/ascending params (returns 422)
  // We fetch and sort by volume24hr on our side instead
  const params = new URLSearchParams();
  params.set('active', 'true');
  params.set('closed', 'false');
  params.set('limit', searchParams.get('limit') || '50');

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
      const errText = await res.text().catch(() => '');
      return NextResponse.json({ error: `Polymarket API error: ${res.status}`, detail: errText }, { status: res.status });
    }

    const data = await res.json();

    // Sort by 24h volume descending (trending) unless fetching by slug
    if (!slug && Array.isArray(data)) {
      data.sort((a: any, b: any) => (b.volume24hr || 0) - (a.volume24hr || 0));
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('Polymarket proxy error:', err);
    return NextResponse.json({ error: 'Failed to fetch from Polymarket' }, { status: 500 });
  }
}
