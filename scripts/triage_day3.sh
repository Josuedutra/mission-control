#!/usr/bin/env bash
set -euo pipefail

: "${CONVEX_SITE_URL:?Set CONVEX_SITE_URL}"
: "${MC_HTTP_SECRET:?Set MC_HTTP_SECRET}"

actor="Jarvis"

tasks_by_board_state() {
  local board="$1"
  local state="$2"
  curl -sS -X POST "$CONVEX_SITE_URL/tasks/listByBoard" \
    -H "content-type: application/json" \
    -H "x-mc-secret: $MC_HTTP_SECRET" \
    -d "{\"board\":\"$board\",\"state\":\"$state\"}"
}

transition() {
  local id="$1"
  local to="$2"
  curl -sS -X POST "$CONVEX_SITE_URL/tasks/transition" \
    -H "content-type: application/json" \
    -H "x-mc-secret: $MC_HTTP_SECRET" \
    -d "{\"id\":\"$id\",\"to\":\"$to\",\"actor\":\"$actor\"}" >/dev/null
}

triage_board() {
  local board="$1"
  echo "== Triage $board =="
  local resp
  resp=$(tasks_by_board_state "$board" "INBOX")

  # Extract id+priority from response using node (available) to avoid jq dependency.
  node - <<'NODE' "$resp"
const raw = process.argv[1];
let data;
try { data = JSON.parse(raw); } catch { console.error('BAD_JSON'); process.exit(1); }
const tasks = data.tasks || [];
for (const t of tasks) {
  console.log(`${t._id}\t${t.priority}\t${t.title}`);
}
NODE
}

# Print what we'd do + apply transitions
apply_board() {
  local board="$1"
  local resp
  resp=$(tasks_by_board_state "$board" "INBOX")

  node - <<'NODE' "$resp" "$board" "$actor"
const raw = process.argv[1];
const board = process.argv[2];
const actor = process.argv[3];
const { execSync } = require('node:child_process');
const site = process.env.CONVEX_SITE_URL;
const secret = process.env.MC_HTTP_SECRET;
const data = JSON.parse(raw);
const tasks = data.tasks || [];
for (const t of tasks) {
  const to = t.priority === 'P0' ? 'READY' : 'TRIAGED';
  const cmd = `curl -sS -X POST "${site}/tasks/transition" -H "content-type: application/json" -H "x-mc-secret: ${secret}" -d '{"id":"${t._id}","to":"${to}","actor":"${actor}"}' >/dev/null`;
  execSync(cmd, { stdio: 'ignore', shell: '/bin/bash' });
  console.log(`[${board}] ${t.priority} -> ${to} :: ${t._id} :: ${t.title}`);
}
NODE
}

apply_board "Ritmo"
apply_board "Company"

echo "Triage complete."
