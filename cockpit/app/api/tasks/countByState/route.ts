import { NextResponse } from 'next/server';
import { z } from 'zod';
import { mcPost } from '../../../../lib/mcProxy';

const Body = z.object({
  state: z.enum(['INBOX', 'TRIAGED', 'READY', 'DOING', 'REVIEW', 'APPROVAL', 'DONE', 'BLOCKED']),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const res = await mcPost<{ ok: true; count: number; ids: string[] }>(`/tasks/countByState`, parsed.data);
    return NextResponse.json(res, { headers: { 'cache-control': 'no-store' } });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'UNKNOWN' }, { status: 500, headers: { 'cache-control': 'no-store' } });
  }
}
