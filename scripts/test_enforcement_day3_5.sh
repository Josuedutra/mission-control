#!/usr/bin/env bash
set -euo pipefail

: "${CONVEX_SITE_URL:?Set CONVEX_SITE_URL}"
: "${MC_HTTP_SECRET:?Set MC_HTTP_SECRET}"

ACTOR="${ACTOR:-Jarvis}"

create_task() {
  local title="$1"
  local board="$2"
  local owner="$3"
  local executor="$4"
  local type="$5"
  local priority="$6"
  local gate="$7"

  curl -sS -X POST "$CONVEX_SITE_URL/tasks/create" \
    -H "content-type: application/json" \
    -H "x-mc-secret: $MC_HTTP_SECRET" \
    -d "{\"title\":\"$title\",\"description\":\"Day3.5 enforcement test\",\"board\":\"$board\",\"product\":\"$board\",\"domain\":\"Ops\",\"type\":\"$type\",\"priority\":\"$priority\",\"owner\":\"$owner\",\"executor\":\"$executor\",\"gate\":\"$gate\",\"evidenceRequired\":false,\"slaClass\":\"standard\",\"riskScore\":1}"
}

start_doing_no_dod() {
  local id="$1"
  curl -sS -X POST "$CONVEX_SITE_URL/tasks/startDoing" \
    -H "content-type: application/json" \
    -H "x-mc-secret: $MC_HTTP_SECRET" \
    -d "{\"id\":\"$id\",\"actor\":\"$ACTOR\"}"
}

start_doing_seed_dod() {
  local id="$1"
  curl -sS -X POST "$CONVEX_SITE_URL/tasks/startDoing" \
    -H "content-type: application/json" \
    -H "x-mc-secret: $MC_HTTP_SECRET" \
    -d "{\"id\":\"$id\",\"actor\":\"$ACTOR\",\"dodIfEmpty\":[{\"label\":\"Scope\",\"done\":false}]}"
}

count_doing() {
  curl -sS -X POST "$CONVEX_SITE_URL/tasks/countByState" \
    -H "content-type: application/json" \
    -H "x-mc-secret: $MC_HTTP_SECRET" \
    -d '{"state":"DOING"}'
}

list_doing_min() {
  curl -sS -X POST "$CONVEX_SITE_URL/tasks/listByStateMinimal" \
    -H "content-type: application/json" \
    -H "x-mc-secret: $MC_HTTP_SECRET" \
    -d '{"state":"DOING"}'
}

cleanup_test_doing() {
  # Move any DOING tasks with title prefix [TEST] back to READY
  # Use a temp file to avoid pipe truncation/broken pipe issues.
  local tmp
  tmp=$(mktemp)
  list_doing_min >"$tmp"

  node - <<'NODE' "$tmp"
const fs = require('node:fs');
const file = process.argv[2];
const raw = fs.readFileSync(file,'utf8');
if (!raw || raw.trim().length === 0) process.exit(0);
const j = JSON.parse(raw);
const items = j.items || [];
for (const it of items) {
  if (typeof it.title === 'string' && it.title.startsWith('[TEST]')) {
    console.log(it.id);
  }
}
NODE

  rm -f "$tmp"
}

node_get_id='const fs=require("node:fs"); const raw=fs.readFileSync(0,"utf8"); const j=JSON.parse(raw); if(!j.id) process.exit(2); process.stdout.write(j.id);'

echo "== Cleanup: move [TEST] DOING back to READY (keep real work) =="
for id in $(cleanup_test_doing); do
  curl -sS -X POST "$CONVEX_SITE_URL/tasks/transition" \
    -H "content-type: application/json" \
    -H "x-mc-secret: $MC_HTTP_SECRET" \
    -d "{\"id\":\"$id\",\"to\":\"READY\",\"actor\":\"$ACTOR\"}" >/dev/null || true
  echo "moved [TEST] $id -> READY"
done

echo "== Test D: DoD obrigatório (startDoing sem dodIfEmpty deve falhar) =="
D_TASK_JSON=$(create_task "[TEST] DoD required" "Company" "Friday" "Friday" "OPS" "P2" "None")
D_ID=$(printf '%s' "$D_TASK_JSON" | node -e "$node_get_id")
set +e
D_RES=$(start_doing_no_dod "$D_ID" 2>&1)
set -e
echo "$D_RES" | grep -q "MISSING_DOD_CHECKLIST" && echo "PASS D" || { echo "FAIL D: $D_RES"; exit 1; }

# Current: 3 DOING already in Ritmo.

echo "== Test C: WIP por executor (max 2) =="
TEST_EXECUTOR="${TEST_EXECUTOR:-Wong}"
C1=$(create_task "[TEST] Exec WIP 1" "Company" "$TEST_EXECUTOR" "$TEST_EXECUTOR" "OPS" "P2" "None")
C2=$(create_task "[TEST] Exec WIP 2" "Company" "$TEST_EXECUTOR" "$TEST_EXECUTOR" "OPS" "P2" "None")
C3=$(create_task "[TEST] Exec WIP 3" "Company" "$TEST_EXECUTOR" "$TEST_EXECUTOR" "OPS" "P2" "None")
C1_ID=$(printf '%s' "$C1" | node -e "$node_get_id")
C2_ID=$(printf '%s' "$C2" | node -e "$node_get_id")
C3_ID=$(printf '%s' "$C3" | node -e "$node_get_id")

echo "startDoing C1 ($TEST_EXECUTOR)"; start_doing_seed_dod "$C1_ID" | grep -q '"ok":true' || { echo "FAIL C1 start"; exit 1; }

echo "startDoing C2 ($TEST_EXECUTOR)"; start_doing_seed_dod "$C2_ID" | grep -q '"ok":true' || { echo "FAIL C2 start"; exit 1; }

set +e
C3_RES=$(start_doing_seed_dod "$C3_ID" 2>&1)
set -e
echo "$C3_RES" | grep -q "WIP_LIMIT_EXECUTOR_DOING_MAX_2" && echo "PASS C" || { echo "FAIL C: $C3_RES"; exit 1; }

# Global WIP: after C1+C2, global DOING is at least 5 (3 Ritmo + 2 Company).

echo "== Test A: WIP global (max 6) =="
# Make sure we are at exactly 6 DOING before trying the 7th.
while true; do
  DOING_JSON=$(count_doing)
  DOING_COUNT=$(printf '%s' "$DOING_JSON" | node -e 'const fs=require("node:fs"); const raw=fs.readFileSync(0,"utf8"); const j=JSON.parse(raw); process.stdout.write(String(j.count||0));')
  echo "Current global DOING: $DOING_COUNT"
  if [ "$DOING_COUNT" -ge 6 ]; then
    break
  fi
  # Create + start a filler task (use a dedicated executor to avoid colliding with Test C executor WIP)
  F_EXEC="${FILLER_EXECUTOR:-Wanda}"
  F=$(create_task "[TEST] Global WIP filler" "Company" "$F_EXEC" "$F_EXEC" "OPS" "P2" "None")
  F_ID=$(printf '%s' "$F" | node -e "$node_get_id")
  F_RES=$(start_doing_seed_dod "$F_ID" 2>&1)
  echo "$F_RES" | grep -q '"ok":true' || { echo "FAIL: filler start: $F_RES"; exit 1; }
  sleep 0.2
done

A2=$(create_task "[TEST] Global WIP 7th" "Company" "Wanda" "Wanda" "OPS" "P2" "None")
A2_ID=$(printf '%s' "$A2" | node -e "$node_get_id")
set +e
A2_RES=$(start_doing_seed_dod "$A2_ID" 2>&1)
set -e

echo "$A2_RES" | grep -q "WIP_LIMIT_GLOBAL_DOING_MAX_6" && echo "PASS A" || { echo "FAIL A: $A2_RES"; exit 1; }

echo "All enforcement tests PASS (A,C,D)."

echo "NOTE: Test B (Ritmo max 3) is already satisfied by current state; run manually by trying to startDoing any 4th Ritmo task."
