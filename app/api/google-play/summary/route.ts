import { NextResponse } from 'next/server';
import { verifyFounderRequest } from '@/lib/server/founderRequest';
import { loadPlayDashboardData, PlayDashboardData } from '@/lib/server/playLive';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CACHE_MS = 15 * 60 * 1000;
let cache: PlayDashboardData | null = null;
let requestInFlight: Promise<PlayDashboardData> | null = null;

async function getData(force: boolean) {
  if (!force && cache && Date.now() - cache.fetchedAt < CACHE_MS) return cache;
  if (!force && requestInFlight) return requestInFlight;
  requestInFlight = loadPlayDashboardData();
  try {
    cache = await requestInFlight;
    return cache;
  } finally {
    requestInFlight = null;
  }
}

export async function GET(request: Request) {
  const founder = await verifyFounderRequest(request);
  if (!founder.ok) return NextResponse.json({ error: founder.reason }, { status: founder.status });

  const url = new URL(request.url);
  const force = url.searchParams.get('refresh') === '1';
  try {
    const data = await getData(force);
    return NextResponse.json(data, {
      headers: { 'cache-control': 'private, no-store', 'x-bhumi-source': data.mode },
    });
  } catch {
    return NextResponse.json({ error: 'play_data_unavailable' }, { status: 502 });
  }
}
