import { Callout } from '../../components/Callout';

export default async function AgentsPage() {
  // v0 placeholder: backend already has agents table, but no HTTP route yet.
  // We keep this in scope as a UI shell so we can plug in read-only data via the proxy layer later.
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Agents</h1>
      <Callout title="Not wired yet (v0)">
        This panel is scaffolded. Next step is to add read-only API routes that query agents + last activity (no client secrets).
      </Callout>
    </div>
  );
}
