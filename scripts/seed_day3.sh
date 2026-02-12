#!/usr/bin/env bash
set -euo pipefail

: "${CONVEX_SITE_URL:?Set CONVEX_SITE_URL}"
: "${MC_HTTP_SECRET:?Set MC_HTTP_SECRET}"

create() {
  local json="$1"
  curl -sS -X POST "$CONVEX_SITE_URL/tasks/create" \
    -H "content-type: application/json" \
    -H "x-mc-secret: $MC_HTTP_SECRET" \
    -d "$json"
  echo
}

transition() {
  local id="$1"
  local to="$2"
  local actor="$3"
  curl -sS -X POST "$CONVEX_SITE_URL/tasks/transition" \
    -H "content-type: application/json" \
    -H "x-mc-secret: $MC_HTTP_SECRET" \
    -d "{\"id\":\"$id\",\"to\":\"$to\",\"actor\":\"$actor\"}"
  echo
}

# NOTE: /tasks/create requires: title, board, product, domain, type, priority, owner, executor, gate, evidenceRequired, slaClass, riskScore
# We keep state=INBOX always.

# --- Ritmo P0 (12)
create '{"title":"[SECURITY][Ritmo] Anti cross-tenant test suite (CI)","description":"Day3 seed","board":"Ritmo","product":"Ritmo","domain":"Security","type":"SECURITY","priority":"P0","owner":"Sentinel","executor":"Friday","gate":"Security","evidenceRequired":true,"slaClass":"urgent","riskScore":5}'
create '{"title":"[SECURITY][Ritmo] Webhook signature verify + replay protection","description":"Day3 seed","board":"Ritmo","product":"Ritmo","domain":"Security","type":"SECURITY","priority":"P0","owner":"Sentinel","executor":"Friday","gate":"Security","evidenceRequired":true,"slaClass":"urgent","riskScore":5}'
create '{"title":"[SECURITY][Ritmo] Rate limiting auth + ingestion endpoints","description":"Day3 seed","board":"Ritmo","product":"Ritmo","domain":"Security","type":"SECURITY","priority":"P0","owner":"Sentinel","executor":"Friday","gate":"Security","evidenceRequired":true,"slaClass":"urgent","riskScore":5}'
create '{"title":"[SECURITY][Ritmo] Logs policy (no PII) + deny hash/HMAC in prod","description":"Day3 seed","board":"Ritmo","product":"Ritmo","domain":"Security","type":"SECURITY","priority":"P0","owner":"Sentinel","executor":"Friday","gate":"Security","evidenceRequired":true,"slaClass":"urgent","riskScore":5}'

create '{"title":"[REVOPS][Ritmo] Payment reconciliation job (Stripe/Ifthenpay ↔ DB)","description":"Day3 seed","board":"Ritmo","product":"Ritmo","domain":"RevOps","type":"REVOPS","priority":"P0","owner":"Ledger","executor":"Friday","gate":"RevOps","evidenceRequired":true,"slaClass":"standard","riskScore":4}'
create '{"title":"[REVOPS][Ritmo] Plan enforcement + downgrade/upgrade rules","description":"Day3 seed","board":"Ritmo","product":"Ritmo","domain":"RevOps","type":"REVOPS","priority":"P0","owner":"Ledger","executor":"Friday","gate":"RevOps","evidenceRequired":true,"slaClass":"standard","riskScore":4}'

create '{"title":"[FEATURE][Ritmo] BCC ingestion stability (idempotency + dedupe)","description":"Day3 seed","board":"Ritmo","product":"Ritmo","domain":"Security","type":"FEATURE","priority":"P0","owner":"Friday","executor":"Friday","gate":"Security","evidenceRequired":true,"slaClass":"urgent","riskScore":5}'
create '{"title":"[FEATURE][Ritmo] Call-ready D+7 script generation (template v1)","description":"Day3 seed","board":"Ritmo","product":"Ritmo","domain":"Product","type":"FEATURE","priority":"P0","owner":"Founder","executor":"Friday","gate":"Product","evidenceRequired":true,"slaClass":"standard","riskScore":3}'

create '{"title":"[OPS][Ritmo] Dashboard mínimo (errors, webhook failures, ingestion backlog)","description":"Day3 seed","board":"Ritmo","product":"Ritmo","domain":"Ops","type":"OPS","priority":"P0","owner":"Friday","executor":"Friday","gate":"None","evidenceRequired":true,"slaClass":"standard","riskScore":3}'
create '{"title":"[OPS][Ritmo] Alerts mínimos (email/telegram) para P0","description":"Day3 seed","board":"Ritmo","product":"Ritmo","domain":"Ops","type":"OPS","priority":"P0","owner":"Friday","executor":"Friday","gate":"None","evidenceRequired":true,"slaClass":"standard","riskScore":3}'

create '{"title":"[FEATURE][Ritmo] Smoke E2E (login → connect BCC → create follow-up)","description":"Day3 seed","board":"Ritmo","product":"Ritmo","domain":"Product","type":"FEATURE","priority":"P0","owner":"Shuri","executor":"Friday","gate":"Product","evidenceRequired":true,"slaClass":"urgent","riskScore":4}'
create '{"title":"[INCIDENT][Ritmo] Tabletop incident drill (tenant leak + billing mismatch)","description":"Day3 seed","board":"Ritmo","product":"Ritmo","domain":"Security","type":"INCIDENT","priority":"P0","owner":"Sentinel","executor":"Founder","gate":"Security","evidenceRequired":true,"slaClass":"incident","riskScore":5}'

# --- Ritmo P1 (6)
create '{"title":"[FEATURE][Ritmo] Onboarding checklist D0–D2 (in-app)","description":"Day3 seed","board":"Ritmo","product":"Ritmo","domain":"Product","type":"FEATURE","priority":"P1","owner":"Shuri","executor":"Friday","gate":"Product","evidenceRequired":true,"slaClass":"standard","riskScore":3}'
create '{"title":"[DOC][Ritmo] Runbook Go-Live + rollback","description":"Day3 seed","board":"Ritmo","product":"Ritmo","domain":"Docs","type":"DOC","priority":"P1","owner":"Wong","executor":"Founder","gate":"None","evidenceRequired":true,"slaClass":"standard","riskScore":2}'
create '{"title":"[OPS][Ritmo] Support workflow (beta) + SLA v0","description":"Day3 seed","board":"Ritmo","product":"Ritmo","domain":"Ops","type":"OPS","priority":"P1","owner":"Founder","executor":"Founder","gate":"None","evidenceRequired":true,"slaClass":"standard","riskScore":2}'
create '{"title":"[CONTENT][Ritmo] Landing v1 (ICP + CTA)","description":"Day3 seed","board":"Ritmo","product":"Ritmo","domain":"Growth","type":"CONTENT","priority":"P1","owner":"Wanda","executor":"Fury","gate":"Claims","evidenceRequired":true,"slaClass":"standard","riskScore":2}'
create '{"title":"[CONTENT][Ritmo] 3-sequence follow-up (trial→paid)","description":"Day3 seed","board":"Ritmo","product":"Ritmo","domain":"Lifecycle","type":"CONTENT","priority":"P1","owner":"Pepper","executor":"Pepper","gate":"Claims","evidenceRequired":true,"slaClass":"standard","riskScore":2}'
create '{"title":"[RESEARCH][Ritmo] 10 customer calls script + objections list","description":"Day3 seed","board":"Ritmo","product":"Ritmo","domain":"Research","type":"RESEARCH","priority":"P1","owner":"Fury","executor":"Founder","gate":"Claims","evidenceRequired":true,"slaClass":"standard","riskScore":3}'

# --- Company P1 (2)
create '{"title":"[OPS][Company] Secrets & env policy (MC_HTTP_SECRET, HMAC secret, rotation)","description":"Day3 seed","board":"Company","product":"Company","domain":"Security","type":"OPS","priority":"P1","owner":"Sentinel","executor":"Founder","gate":"Security","evidenceRequired":true,"slaClass":"standard","riskScore":3}'
create '{"title":"[DOC][Company] Operating cadence (daily/weekly) + WIP policy pinned","description":"Day3 seed","board":"Company","product":"Company","domain":"Docs","type":"DOC","priority":"P1","owner":"Wong","executor":"Founder","gate":"None","evidenceRequired":true,"slaClass":"standard","riskScore":2}'

echo "Seed complete."

echo "TIP: To triage P0 -> READY, call /tasks/transition per task id."
