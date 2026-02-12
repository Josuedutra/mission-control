# Mission Control OS for B2B SaaS (OpenClaw)

> **Purpose**: This document revises and operationalizes the attached guide into a **permanent Operating System** for a B2B micro‑SaaS/SaaS company using **OpenClaw**. It is designed to outlive any single program (e.g., IEFP), scale across **multiple products**, and support **one human manager** with **specialist AI agents**.

---

## 0. Executive Summary

* **IEFP is temporary**; the **Operating System is permanent**.
* The company runs as a **portfolio of products**, each with a **product pod**, supported by **shared services** (Security, RevOps, PMO, Docs).
* **Agents are specialists**, not headcount. The number of agents can grow/shrink; **governance, gates, and evidence stay fixed**.
* **OpenClaw** provides persistence (sessions, memory, workspace) and automation (heartbeats), with **security-first guardrails**.

---

## 1. Design Principles (Non‑Negotiable)

1. **Separation of concerns**: Company Ops, Product Ops, Product Factory.
2. **Gates before Done**: Security, RevOps, Claims, Product.
3. **Evidence over opinions**: every claim, change, or decision leaves artifacts.
4. **Disk is the trust boundary**: no secrets/PII in logs; least privilege per agent.
5. **Cheap checks first**: heartbeats validate state before expensive actions.
6. **Pods over teams**: products are isolated; shared services are authoritative.

---

## 2. System Topology

### 2.1 Boards (Views)

* **Inbox** (single intake)
* **Company Board** (legal, finance, procurement, partners)
* **Product Boards** (one per product: e.g., Ritmo)
* **Factory Board** (discovery → MVP pipeline)
* **Portfolio Board** (macro priorities and sequencing)

### 2.2 Shared Services (Permanent)

* **PMO/Coordinator**
* **Security/Compliance**
* **RevOps/Finance**
* **Documentation/Knowledge**
* **Product/QA**

### 2.3 Product Pods (Per Product)

* **Developer**
* **Product/QA**
* **Security (gate)**
* **RevOps (gate)**
* **Support/Success (as needed)**

---

## 3. Task Taxonomy (Permanent)

### 3.1 Types

* EPIC, FEATURE, BUG, SECURITY, REVOPS, OPS, RESEARCH, CONTENT, DOC, INCIDENT

### 3.2 Mandatory Fields

* Board, Product, Type, Priority (P0–P3), Owner
* Gate (None/Security/RevOps/Claims/Product)
* Evidence Required (default: Yes)
* Definition of Done (checklist)

### 3.3 States & WIP

* INBOX → TRIAGED → READY → DOING → REVIEW → APPROVAL → DONE (+ BLOCKED)
* WIP limits: Human ≤3 DOING; Agent ≤2 DOING; Total ≤8 DOING

---

## 4. Governance & Gates

### 4.1 Gates

* **Security Gate**: auth, multi‑tenant, PII, BCC ingestion, webhooks, storage, logs, rate limits.
* **RevOps Gate**: pricing, plans, trials, billing, invoices, reconciliation.
* **Claims Gate**: public claims, comparisons, ROI statements (must include receipts).
* **Product Gate**: UX, onboarding, fallback behavior.

### 4.2 Authority

* Security can **stop‑the‑line**.
* RevOps controls money flows.
* Final approval rests with the Founder.

---

## 5. Agent Model (Scalable, Not Fixed)

### 5.1 Permanent Core (Always On)

* **Coordinator (PMO)**: triage, cadence, dependencies, decisions.
* **Developer**: delivery, CI/CD, reliability.
* **Security/Compliance**: threat models, hardening, incidents.
* **RevOps/Finance**: pricing, billing, metrics.
* **Documentation**: runbooks, decisions, audit trail.
* **Product/QA**: regressions, edge cases, acceptance.

### 5.2 Variable Specialists (On‑Demand)

* Research/Market Intelligence
* Growth Content (SEO + Copy)
* Lifecycle/Email
* Design
* Partnerships

### 5.3 Temporary Pods

* **IEFP Evidence Pod** (procurement, evidence, justification). After IEFP, hibernate the pod; keep templates.

---

## 6. Memory & Documentation (Persistence)

* **WORKING.md**: current state
* **DECISIONS.md**: decisions + rationale
* **RISK_REGISTER.md**: risks, mitigations, triggers
* **RUNBOOKS/**: go‑live, rollback, incidents
* **Product Playbooks**: reusable per product

Rule: if it must persist, it must be written.

---

## 7. Heartbeats (OpenClaw)

* Core agents: 15–30 min
* Specialists: 60–120 min or on‑demand
* Heartbeats perform **cheap checks** and return OK unless action is needed.

---

## 8. Daily & Weekly Cadence

### Daily Standup (auto‑compiled)

* Completed / In Progress / Blocked
* Decisions Needed
* Security & Billing changes

### Weekly Planning

* Portfolio priorities
* WIP review
* Risk review

---

## 9. Product Lifecycle (Reusable Pipeline)

1. **Discovery**: ICP, problem, value, price hypothesis, risk.
2. **MVP Build**: MVSP security, tests, observability.
3. **Launch**: assets, onboarding, billing, metrics.
4. **Operate**: reliability, churn, incremental value.
5. **Kill/Scale**: evidence‑based decision.

---

## 10. IEFP Alignment (Non‑Definitive)

* Treat IEFP as a **project**, not the company.
* Run an **IEFP Evidence Pod** with strict templates.
* After submission, **decommission the pod**; keep the OS unchanged.

---

## 11. OpenClaw Configuration Notes

* Use OpenClaw native paths and JSON5 config.
* Enforce least‑privilege tools per agent.
* Lock down workspace permissions.
* Maintain a kill‑switch for write actions.

---

## 12. Security Baseline (Permanent)

* Tenant isolation tests
* Signed URLs (expiry + scope)
* Webhook signature verification
* Rate limits on auth/ingestion/exports
* Logs without PII
* Backup & restore drills

---

## 13. Metrics (Minimum Viable)

* Activation (D0–D2)
* Conversion (trial→paid)
* Churn
* ARPA
* Incident rate

---

## 14. What Stays vs What Changes

**Stays forever**: OS, taxonomy, gates, shared services.  
**Changes per phase**: number of agents, pods, cadence intensity.

---

## Appendix A — Ticket Templates

(Include Feature, Security, RevOps, Incident templates with DoD and evidence checklists.)

## Appendix B — Decommissioning IEFP Pod

* Freeze evidence
* Archive dossier
* Disable heartbeats
* Keep templates
