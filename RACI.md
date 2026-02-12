# RACI.md — Gate & Decision Authority Matrix (v1)

## Roles
- **Founder** (human owner)
- **Coordinator (PMO / Jarvis)**
- **Developer (Friday)**
- **Security (Sentinel)**
- **RevOps (Ledger)**
- **Product/QA (Shuri)**
- **Research (Fury)**
- **Documentation (Wong)**

## RACI Legend
- **R** Responsible (executes)
- **A** Accountable (final owner)
- **C** Consulted
- **I** Informed

## 1) Security Gate
- Threat model / hardening / auth / payments risk changes
  - R: Security
  - A: Security
  - C: Developer, Product/QA
  - I: Coordinator, Founder
- Critical conflict rule: **Security is binding**. Only Founder can accept explicit risk override.

## 2) RevOps Gate
- Pricing logic, billing rules, reconciliation, refund policy
  - R: RevOps
  - A: RevOps
  - C: Developer, Coordinator
  - I: Founder, Product/QA
- Critical conflict rule: **Pricing/billing changes require Founder approval for production**.

## 3) Claims Gate
- Public claims (ROI, benchmark, guarantees, comparative statements)
  - R: Research
  - A: Research
  - C: Growth Content, RevOps (if financial claim)
  - I: Coordinator, Founder
- Critical conflict rule: no publication without evidence links.

## 4) Product Gate
- Acceptance criteria, release readiness, regression pass
  - R: Product/QA
  - A: Product/QA
  - C: Developer
  - I: Coordinator, Founder

## 5) Incident Decisions (P0/P1)
- Technical response
  - R: Developer + Security
  - A: Security (security incidents) / Developer (availability incidents)
  - C: RevOps (if billing impact), Product/QA
  - I: Coordinator, Founder
- External communication
  - R: Coordinator
  - A: Founder
  - C: Security, RevOps
  - I: All

## 6) Task Closure Rule
A task can only move to DONE when:
- Required Gate approved
- Evidence attached
- Documentation reference attached
- Owner confirms DoD checklist completion
