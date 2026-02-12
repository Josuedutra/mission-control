# Mission Control (Convex)

This Convex app implements the Mission Control runtime layer:
- Fail-closed schema (enums)
- Task state machine transitions (runtime validation)
- Gate approvals (approver != executor)
- Activity audit log (append-only)

HTTP Actions:
- GET  /health
- POST /tasks/create (requires `X-MC-SECRET`) (supports optional `executor`)
- POST /tasks/setDod (requires `X-MC-SECRET`)
- POST /tasks/startDoing (requires `X-MC-SECRET`)
- POST /tasks/transition (requires `X-MC-SECRET`)
- POST /tasks/evidence (requires `X-MC-SECRET`)
- POST /tasks/approve (requires `X-MC-SECRET`)
- POST /tasks/override (requires `X-MC-SECRET`)

Env:
- `MC_HTTP_SECRET` (required, fail-closed)

Next steps:
- Add rate limiting for HTTP actions (day 2)
- Expand list queries into HTTP endpoints (if needed)
