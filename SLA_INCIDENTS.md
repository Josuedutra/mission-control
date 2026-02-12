# SLA_INCIDENTS.md — Incident Severity & Response (v1)

## Severity Levels
- **P0 (Critical):** Security breach risk, cross-tenant leakage, billing corruption, total outage.
- **P1 (High):** Major feature unavailable, payment failures affecting active users.
- **P2 (Medium):** Degraded performance or partial workflow failure.
- **P3 (Low):** Minor bug with workaround.

## Response Targets
- **P0**
  - Acknowledge: <= 15 min
  - Mitigation start: <= 30 min
  - Status updates: every 30 min
  - Postmortem: <= 24h
- **P1**
  - Acknowledge: <= 30 min
  - Mitigation start: <= 2h
  - Status updates: every 2h
  - Postmortem: <= 48h
- **P2**
  - Acknowledge: <= 4h
  - Mitigation: <= 1 business day
- **P3**
  - Acknowledge: <= 1 business day
  - Schedule in backlog

## Escalation Protocol
1. Open INCIDENT ticket with severity, impact, owner.
2. Tag Coordinator + relevant gate owner (Security/RevOps).
3. Move to BLOCKED only if external dependency; otherwise keep in DOING.
4. If P0/P1, notify Founder immediately.

## Exit Criteria
Incident is resolved only when:
- Service stabilized
- Root cause documented
- Preventive action ticket created
- Evidence/logs linked
