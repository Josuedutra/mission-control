import { Stat } from '../components/Stat';
import { Callout } from '../components/Callout';

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || (json as any).ok === false) {
    throw new Error((json as any).error ?? `HTTP_${res.status}`);
  }
  return json as T;
}

export default async function DashboardPage() {
  // Minimal dashboard: WIP counter (DOING), blocked count, approvals (APPROVAL state), health.
  let doing = 0;
  let blocked = 0;
  let approval = 0;
  let healthOk = false;
  let err: string | null = null;

  try {
    const [doingRes, blockedRes, approvalRes] = await Promise.all([
      postJson<{ ok: true; count: number }>(`/api/tasks/countByState`, { state: 'DOING' }),
      postJson<{ ok: true; count: number }>(`/api/tasks/countByState`, { state: 'BLOCKED' }),
      postJson<{ ok: true; count: number }>(`/api/tasks/countByState`, { state: 'APPROVAL' }),
    ]);
    doing = doingRes.count;
    blocked = blockedRes.count;
    approval = approvalRes.count;

    const h = await fetch(`/api/health`, { cache: 'no-store' });
    healthOk = h.ok;
  } catch (e: any) {
    err = e?.message ?? 'UNKNOWN_ERROR';
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>

      {err ? (
        <Callout title="Fail-closed error">
          <div className="font-mono text-xs whitespace-pre-wrap">{err}</div>
        </Callout>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <Stat label="WIP (DOING)" value={doing} />
        <Stat label="Blocked" value={blocked} />
        <Stat label="In APPROVAL" value={approval} />
        <Stat label="Health" value={healthOk ? 'OK' : 'FAIL'} />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Callout title="Pending approvals">
          This v0 uses state=APPROVAL as the operational signal. (No new backend logic.)
        </Callout>
        <Callout title="Next actions">
          Use the board views to transition tasks. All writes go through server-side API routes that inject X-MC-SECRET.
        </Callout>
      </div>
    </div>
  );
}
