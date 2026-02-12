# EVIDENCE_STANDARD.md — Evidence by Task Type (v1)

## Universal minimum (all DONE tasks)
1. Deliverable artifact (code/doc/asset)
2. Validation proof (test/log/source)
3. Documentation update reference

## By Gate / Type

### SECURITY
- Required:
  - test evidence (unit/integration/security check)
  - risk note (what was mitigated)
  - log/policy reference
- Suggested:
  - before/after behavior proof

### REVOPS
- Required:
  - reconciliation sample (provider vs DB)
  - pricing/billing rule diff
  - metric impact note (ARPA/churn/etc.)

### CLAIMS
- Required:
  - source links (primary whenever possible)
  - claim-to-source mapping
  - date of verification

### PRODUCT
- Required:
  - acceptance checklist pass
  - regression evidence
  - UX/flow validation note

### INCIDENT
- Required:
  - timeline
  - root cause
  - corrective + preventive actions (CAPA)
  - postmortem link

## Audit Link Convention
Every completed task should include `audit_link` pointing to:
- doc page / PR / dashboard / evidence bundle

## Fail-closed rule
If evidence is missing, task cannot move to DONE.
