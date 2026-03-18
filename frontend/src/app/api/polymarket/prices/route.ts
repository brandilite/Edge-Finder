import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const market = searchParams.get('market');
  const interval = searchParams.get('interval') || '1m';
  const fidelity = searchParams.get('fidelity') || '360';

  if (!market) {
    return NextResponse.json({ error: 'market parameter required' }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://clob.polymarket.com/prices-history?market=${market}&interval=${interval}&fidelity=${fidelity}`,
      {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 60 },
      }
    );

    if (!res.ok) {
      return NextResponse.json({ error: `CLOB API error: ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('CLOB proxy error:', err);
    return NextResponse.json({ error: 'Failed to fetch price history' }, { status: 500 });
  }
}
