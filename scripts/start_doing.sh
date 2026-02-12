#!/usr/bin/env bash
set -euo pipefail

: "${CONVEX_SITE_URL:?Set CONVEX_SITE_URL}"
: "${MC_HTTP_SECRET:?Set MC_HTTP_SECRET}"
: "${TASK_ID:?Set TASK_ID}"

ACTOR="${ACTOR:-Jarvis}"

# Default DoD checklist (seeded only if empty)
DOD_JSON='[
  {"label":"Scope definido (in/out)","done":false},
  {"label":"Validação executada (teste/log)","done":false},
  {"label":"Evidência anexada (link)","done":false},
  {"label":"Docs atualizadas (ref)","done":false}
]'

payload=$(cat <<JSON
{"id":"$TASK_ID","actor":"$ACTOR","dodIfEmpty":$DOD_JSON}
JSON
)

curl -sS -X POST "$CONVEX_SITE_URL/tasks/startDoing" \
  -H "content-type: application/json" \
  -H "x-mc-secret: $MC_HTTP_SECRET" \
  -d "$payload"
