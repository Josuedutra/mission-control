import { Callout } from '../../../components/Callout';

const STATES = ['INBOX', 'TRIAGED', 'READY', 'DOING', 'REVIEW', 'APPROVAL', 'BLOCKED', 'DONE'] as const;

type State = (typeof STATES)[number];

type Task = {
  _id: string;
  title: string;
  priority: string;
  executor?: string;
  gate?: string;
  state: State;
};

async function list(board: string, state: State) {
  const res = await fetch(`/api/tasks/listByBoard`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ board, state }),
    cache: 'no-store',
  });
  const json = await res.json();
  if (!res.ok || json.ok === false) throw new Error(json.error ?? `HTTP_${res.status}`);
  return json.tasks as Task[];
}

export default async function BoardPage({ params }: { params: { board: string } }) {
  const board = params.board;
  let columns: Record<string, Task[]> = {};
  let err: string | null = null;

  try {
    const results = await Promise.all(STATES.map((s) => list(board, s)));
    STATES.forEach((s, i) => (columns[s] = results[i]));
  } catch (e: any) {
    err = e?.message ?? 'UNKNOWN_ERROR';
  }

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h1 className="text-xl font-semibold">Board: {board}</h1>
        <div className="text-xs text-slate-500">Filters v0: use browser find; advanced filters later.</div>
      </div>

      {err ? (
        <Callout title="Fail-closed error">
          <div className="font-mono text-xs whitespace-pre-wrap">{err}</div>
        </Callout>
      ) : null}

      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
        {STATES.map((s) => (
          <div key={s} className="rounded border">
            <div className="border-b bg-slate-50 px-3 py-2 text-sm font-medium flex justify-between">
              <span>{s}</span>
              <span className="text-slate-500">{(columns[s] ?? []).length}</span>
            </div>
            <div className="p-2 space-y-2">
              {(columns[s] ?? []).map((t) => (
                <a
                  key={t._id}
                  href={`/task/${t._id}`}
                  className="block rounded border px-3 py-2 hover:bg-slate-50"
                >
                  <div className="text-sm font-medium">{t.title}</div>
                  <div className="mt-1 text-xs text-slate-600 flex gap-2 flex-wrap">
                    <span className="font-mono">{t._id}</span>
                    <span>prio:{t.priority}</span>
                    {t.executor ? <span>exec:{t.executor}</span> : null}
                    {t.gate && t.gate !== 'None' ? <span className="rounded bg-amber-100 px-1">gate:{t.gate}</span> : null}
                  </div>
                </a>
              ))}
              {(columns[s] ?? []).length === 0 ? <div className="text-xs text-slate-400 px-1">Empty</div> : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
