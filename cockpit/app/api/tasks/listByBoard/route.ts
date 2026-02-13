import { NextResponse } from 'next/server';
import { z } from 'zod';
import { mcPost } from '../../../../lib/mcProxy';

const Body = z.object({
  board: z.enum(['Inbox', 'Company', 'Ritmo', 'Factory', 'Portfolio']),
  state: z
    .enum(['INBOX', 'TRIAGED', 'READY', 'DOING', 'REVIEW', 'APPROVAL', 'DONE', 'BLOCKED'])
    .optional(),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const res = await mcPost<{ ok: true; tasks: any[] }>(`/tasks/listByBoard`, parsed.data);
    return NextResponse.json(res, { headers: { 'cache-control': 'no-store' } });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'UNKNOWN' }, { status: 500, headers: { 'cache-control': 'no-store' } });
  }
}
