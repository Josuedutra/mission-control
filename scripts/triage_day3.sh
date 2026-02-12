#!/usr/bin/env bash
set -euo pipefail

: "${CONVEX_SITE_URL:?Set CONVEX_SITE_URL}"
: "${MC_HTTP_SECRET:?Set MC_HTTP_SECRET}"

actor="Jarvis"

tasks_by_board_state() {
  local board="$1"
  local state="$2"
  curl -sS -X POST "$CONVEX_SITE_URL/tasks/triageList" \
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
  printf '%s' "$resp" | node - <<'NODE'
const fs = require('node:fs');
const raw = fs.readFileSync(0, 'utf8');
let data;
try { data = JSON.parse(raw); } catch (e) { console.error('BAD_JSON', e?.message); process.exit(1); }
const items = data.items || [];
for (const t of items) {
  console.log(`${t.id}\t${t.priority}\t${t.title}`);
}
NODE
}

# Print what we'd do + apply transitions
apply_board() {
  local board="$1"
  local tmp
  tmp=$(mktemp)

  # Avoid pipe/broken-pipe issues by writing response to a temp file first.
  curl -sS -o "$tmp" -X POST "$CONVEX_SITE_URL/tasks/triageList" \
    -H "content-type: application/json" \
    -H "x-mc-secret: $MC_HTTP_SECRET" \
    -d "{\"board\":\"$board\",\"state\":\"INBOX\"}"

  node - <<'NODE' "$tmp" "$board" "$actor"
const fs = require('node:fs');
// argv: [node, '-', file, board, actor]
const file = process.argv[2];
const board = process.argv[3];
const actor = process.argv[4];
const { execSync } = require('node:child_process');
const site = process.env.CONVEX_SITE_URL;
const secret = process.env.MC_HTTP_SECRET;

const raw = fs.readFileSync(file, 'utf8');
if (!raw || raw.trim().length === 0) {
  console.error('EMPTY_RESPONSE');
  process.exit(1);
}

let data;
try {
  data = JSON.parse(raw);
} catch (e) {
  console.error('BAD_JSON', e?.message);
  console.error(raw.slice(0, 200));
  process.exit(1);
}

const items = data.items || [];
for (const t of items) {
  const to = t.priority === 'P0' ? 'READY' : 'TRIAGED';
  const cmd = `curl -sS -X POST "${site}/tasks/transition" -H "content-type: application/json" -H "x-mc-secret: ${secret}" -d '{"id":"${t.id}","to":"${to}","actor":"${actor}"}' >/dev/null`;
  execSync(cmd, { stdio: 'ignore', shell: '/bin/bash' });
  console.log(`[${board}] ${t.priority} -> ${to} :: ${t.id} :: ${t.title}`);
}
NODE

  rm -f "$tmp"
}

apply_board "Ritmo"
apply_board "Company"

echo "Triage complete."
