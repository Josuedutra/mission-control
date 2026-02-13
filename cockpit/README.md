# Cockpit v0 (Mission Control)

Internal-first operational UI for Mission Control. This is a **thin interface layer**:
- **No backend rule changes**
- **No secrets in client bundle**
- All Convex HTTP calls are proxied through Next.js API routes that inject `X-MC-SECRET` server-side.

## Features (v0)

- `/` Dashboard
  - WIP (DOING) counter
  - Blocked counter
  - APPROVAL counter (state-based signal)
  - Health check
- `/board/[board]` Kanban view (columns by state)
- `/task/[id]` Minimal task actions
  - Safe transitions via proxy
  - Evidence attach via proxy
- `/agents` Scaffold (not wired yet)

## Setup

From repo root:

```bash
cd cockpit
npm install
cp .env.example .env.local
```

Edit `cockpit/.env.local`:

```bash
MC_CONVEX_SITE_URL="https://<deployment>.convex.site"
MC_HTTP_SECRET="<secret>"  # IMPORTANT: no quotes in the actual value

# Recommended (if not strictly localhost):
MC_UI_BASIC_AUTH="user:pass"
```

Run:

```bash
npm run dev
```

Open: http://localhost:3000

## Notes

- Fail-closed: backend errors are surfaced in the UI as explicit callouts.
- Pending approvals: v0 uses `state=APPROVAL` only (no new approval logic).
