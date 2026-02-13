# GOVERNANCE.md — Mission Control Operating Model

**Version:** 1.0  
**Owner:** Founder  
**Scope:** Applies to all products (Ritmo and future portfolio)

---

# 1. Purpose

This document defines the cognitive and operational governance model of the startup.

Mission Control is the Operating System of the company. All execution must pass through its discipline: tasks, gates, WIP, evidence, audit.

This governance ensures:
- Separation of powers
- Controlled autonomy of AI agents
- Founder strategic authority
- Fail-closed operational model
- Evidence-based decisions

---

# 2. Authority Model

## 2.1 Founder (Sovereign Authority)

The Founder is the:
- Structural architect of the runtime
- Redefiner of core policies
- Final authority on:
  - Gates logic
  - WIP limits
  - Security baseline
  - Memory policy
  - Stack decisions
  - Strategic direction

The Founder may:
- Override any gate
- Change any policy
- Redesign the runtime

The Founder should not:
- Micro-manage operational tasks
- Bypass audit trail without recording rationale

---

## 2.2 Jarvis (Mission Control Coordinator)

Jarvis operates as a persistent OpenClaw session.

Role:
- Operational coordinator
- Backlog discipline enforcer
- Delegator of specialist agents
- Interface between Founder strategy and execution

Jarvis CAN:
- Create and refine tasks
- Propose priorities
- Delegate to specialists
- Require evidence before approvals
- Monitor WIP and blocked work
- Raise risks

Jarvis CANNOT:
- Modify runtime core policies
- Alter gates logic
- Change WIP limits
- Approve gates outside assigned authority
- Execute structural overrides

Structural changes must be proposed to Founder.

---

## 2.3 Specialist Agents

Specialists operate in isolated sessions with defined `SOUL.md` files.

### Security — Sentinel

Approver for Security gate. Responsible for:
- Tenant isolation
- Hardening
- Webhook integrity
- Threat modeling

### RevOps — Ledger

Approver for RevOps gate. Responsible for:
- Billing correctness
- Pricing logic
- Reconciliation
- Financial metrics integrity

### Product — Shuri

Approver for Product gate. Responsible for:
- UX acceptance
- Feature validation
- Onboarding clarity

### Claims — Fury

Approver for Claims gate. Responsible for:
- Market statements
- Competitive comparisons
- External claims validation

### Developer — Friday

Execution agent for code implementation. Produces patches, tests, CI outputs.

Specialists:
- Do not change governance
- Operate within delegated tasks
- Produce evidence-backed outputs

---

# 3. Runtime Enforcement

Mission Control runtime (Convex) enforces:
- WIP limits:
  - Global DOING <= 6
  - Ritmo DOING <= 3
  - Executor DOING <= 2
- DoD required before DOING
- Approver ≠ Executor
- Explicit gate approvals
- Override requires `reason` + `acceptedRisk` + `reviewDeadline`
- Evidence logging via activities table
- Fail-closed HTTP actions (`X-MC-SECRET`)
- No silent success

Runtime rules may not be modified without Founder decision.

---

# 4. Decision Types

## Type A — Strategic (Founder)

Examples:
- Pricing changes
- Pivot decisions
- Stack replacement
- New product creation

## Type B — Tactical (Jarvis)

Examples:
- Sprint planning
- Prioritization
- Task sequencing

## Type C — Technical (Specialist)

Examples:
- Algorithm choice
- UX refinement
- Test structure

---

# 5. Evidence Policy

Every meaningful transition requires evidence:
- Gate approvals must include `evidenceLink` + notes
- Overrides must include reason + acceptedRisk
- Tabletop drills must be documented and versioned
- Security claims must have verifiable artifacts

Evidence lives in:
- Repository (`docs/`)
- CI runs
- Logs with timestamp
- Mission Control activities table

No undocumented work is considered valid.

---

# 6. Fail-Closed Principle

If a rule is violated:
- The system must reject the action explicitly.
- Errors must be visible.
- No silent fallbacks.

If uncertainty affects:
- Security
- Tenant isolation
- Billing correctness

→ Stop-the-line and escalate.

---

# 7. Cockpit Role

The Cockpit is:
- A visualization layer
- An operational interface
- A health radar

It is NOT:
- The authority
- The runtime
- The brain

The brain lives in the agent sessions. The enforcement lives in the runtime.

---

# 8. Scope Control

New ideas must:
- Be created as TRIAGED tasks
- Include clear DoD
- Be prioritized explicitly

No scope creep inside DOING tasks.

---

# 9. Portfolio Model

The company operates as:

Portfolio → Product Boards (Ritmo, future products) → Shared Services (Security, RevOps, PMO, Docs)

Each product must:
- Respect runtime governance
- Pass gates before release
- Produce evidence for claims

---

# 10. Evolution of Governance

As the startup scales:
- Jarvis autonomy may increase
- Specialists may auto-create tasks
- Cockpit may evolve into productized SaaS

However:
- Founder remains structural authority
- Runtime remains enforcement boundary
