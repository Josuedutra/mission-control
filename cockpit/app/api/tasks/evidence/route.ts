import { NextResponse } from 'next/server';
import { z } from 'zod';
import { mcPost } from '../../../../lib/mcProxy';

const Body = z.object({
  id: z.string().min(1),
  actor: z.string().min(1),
  link: z.string().url(),
  note: z.string().min(1).optional(),
  sha: z.string().min(6).optional(),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const res = await mcPost(`/tasks/evidence`, parsed.data);
    return NextResponse.json(res, { headers: { 'cache-control': 'no-store' } });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'UNKNOWN' }, { status: 500, headers: { 'cache-control': 'no-store' } });
  }
}
