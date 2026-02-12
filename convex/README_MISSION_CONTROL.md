# Mission Control (Convex)

This Convex app implements the Mission Control runtime layer:
- Fail-closed schema (enums)
- Task state machine transitions (runtime validation)
- Gate approvals (approver != executor)
- Activity audit log (append-only)

HTTP Actions:
- GET  /health
- POST /tasks/transition

Next steps:
- Add auth for HTTP actions (shared secret header)
- Add override workflow (Founder) + automatic follow-up P0 + risk register entry
- Add queries for boards/views
