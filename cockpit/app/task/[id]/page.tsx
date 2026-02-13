import { Callout } from '../../../components/Callout';

async function transition(id: string, to: string) {
  const res = await fetch(`/api/tasks/transition`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ id, to, actor: 'Jarvis' }),
  });
  const json = await res.json();
  if (!res.ok || json.ok === false) throw new Error(json.error ?? `HTTP_${res.status}`);
  return json;
}

async function evidence(id: string, link: string, note: string) {
  const res = await fetch(`/api/tasks/evidence`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ id, actor: 'Jarvis', link, note }),
  });
  const json = await res.json();
  if (!res.ok || json.ok === false) throw new Error(json.error ?? `HTTP_${res.status}`);
  return json;
}

export default async function TaskPage({ params, searchParams }: { params: { id: string }; searchParams: any }) {
  const id = params.id;
  const action = searchParams?.action as string | undefined;
  const to = searchParams?.to as string | undefined;
  const link = searchParams?.link as string | undefined;
  const note = searchParams?.note as string | undefined;

  let result: any = null;
  let err: string | null = null;

  // v0: no backend endpoint for task.get through MC secret yet; we show id and provide safe actions.
  try {
    if (action === 'transition' && to) {
      result = await transition(id, to);
    }
    if (action === 'evidence' && link) {
      result = await evidence(id, link, note ?? '');
    }
  } catch (e: any) {
    err = e?.message ?? 'UNKNOWN_ERROR';
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Task</h1>

      <div className="rounded border p-4">
        <div className="text-sm text-slate-600">ID</div>
        <div className="font-mono text-sm">{id}</div>
      </div>

      {err ? (
        <Callout title="Fail-closed error">
          <div className="font-mono text-xs whitespace-pre-wrap">{err}</div>
        </Callout>
      ) : null}

      {result ? (
        <Callout title="Result">
          <div className="font-mono text-xs whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</div>
        </Callout>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Callout title="Safe transitions (v0)">
          <div className="text-xs">These trigger server-side API routes (X-MC-SECRET injected). No silent success.</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {['TRIAGED', 'READY', 'DOING', 'REVIEW', 'APPROVAL', 'BLOCKED', 'DONE'].map((s) => (
              <a
                key={s}
                className="rounded border px-2 py-1 text-xs hover:bg-slate-50"
                href={`/task/${id}?action=transition&to=${s}`}
              >
                → {s}
              </a>
            ))}
          </div>
        </Callout>

        <Callout title="Attach evidence (v0)">
          <div className="text-xs">Append link + note using /tasks/evidence schema: link(required), note(optional).</div>
          <div className="mt-2 text-xs text-slate-600">Use query params for now:</div>
          <div className="mt-1 font-mono text-xs whitespace-pre-wrap">{`/task/${id}?action=evidence&link=https://...&note=...`}</div>
        </Callout>
      </div>

      <Callout title="Next">
        Task fields, DoD checklist, activity feed, approvals UI are next phases. This page is intentionally minimal and aligned with existing HTTP surface.
      </Callout>
    </div>
  );
}
