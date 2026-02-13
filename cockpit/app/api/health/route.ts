import { NextResponse } from 'next/server';
import { mcPost } from '../../../lib/mcProxy';

export async function GET() {
  const base = process.env.MC_CONVEX_SITE_URL;
  const secret = process.env.MC_HTTP_SECRET;

  if (!base) {
    return NextResponse.json(
      { ok: false, error: 'SERVER_MISCONFIGURED: MC_CONVEX_SITE_URL missing' },
      { status: 500, headers: { 'cache-control': 'no-store' } },
    );
  }
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: 'SERVER_MISCONFIGURED: MC_HTTP_SECRET missing' },
      { status: 500, headers: { 'cache-control': 'no-store' } },
    );
  }

  try {
    // 1) Ping Convex (public health)
    const h = await fetch(`${base}/health`, { cache: 'no-store' });
    if (!h.ok) {
      const t = await h.text();
      return NextResponse.json(
        { ok: false, error: `UPSTREAM_HEALTH_${h.status}: ${t || h.statusText}` },
        { status: 502, headers: { 'cache-control': 'no-store' } },
      );
    }

    // 2) Validate secret works (authorized call)
    await mcPost(`/tasks/countByState`, { state: 'DOING' });

    return NextResponse.json({ ok: true }, { headers: { 'cache-control': 'no-store' } });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? 'UNKNOWN' },
      { status: 502, headers: { 'cache-control': 'no-store' } },
    );
  }
}
