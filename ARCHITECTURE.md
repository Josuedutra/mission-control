# ARCHITECTURE.md — Mission Control System Architecture

**Version:** 1.0  
**Owner:** Founder  
**Scope:** Technical architecture of the Mission Control Operating System

---

# 1. System Overview

Mission Control is the Operating System of the startup.

It is composed of three primary layers:

1) Cognitive Layer (AI Agents / OpenClaw Sessions)
2) Enforcement Layer (Convex Runtime)
3) Interface Layer (Cockpit UI)

These layers are intentionally separated.

---

# 2. High-Level Architecture

Browser (Cockpit UI - Next.js)
↓
Next.js API Proxy (/api/*)
↓ (injects X-MC-SECRET)
Convex HTTP Actions (/tasks/*)
↓
Convex Runtime (Enforcement & Data)
↓
Database (tasks, activities, agents, documents)

Parallel:
OpenClaw Persistent Sessions (Jarvis + Specialists)
↕ Workspace (repo + artifacts)
↕ Mission Control (shared source of truth)

---

# 3. Layer Responsibilities

## 3.1 Cognitive Layer (OpenClaw Sessions)

Components:
- Jarvis (Coordinator)
- Sentinel (Security)
- Ledger (RevOps)
- Shuri (Product)
- Fury (Claims)
- Friday (Developer)

Characteristics:
- Persistent sessions
- Independent memory contexts
- Defined authority via SOUL.md
- Cannot bypass runtime enforcement
- Operate through Mission Control tasks

No session may:
- Mutate runtime policies
- Access secrets not explicitly provided
- Write directly to database outside approved endpoints

---

## 3.2 Enforcement Layer (Convex Runtime)

Convex is the trust boundary.

Responsibilities:
- WIP enforcement
- Gate validation
- Approver ≠ executor rule
- DoD validation
- Override auditing
- Activity logging
- Fail-closed HTTP routes
- Idempotency safeguards

All write actions must go through:
- POST /tasks/*
- X-MC-SECRET header validation
- Explicit error returns

Runtime is immutable unless Founder-approved change.

---

## 3.3 Interface Layer (Cockpit UI)

Cockpit is a visualization and interaction layer.

Responsibilities:
- Display WIP status
- Display pending approvals (state-based)
- Kanban board view
- Task detail view
- Evidence attach
- Safe transitions
- Error visibility

Constraints:
- No secret exposure to client
- All writes go through Next.js server proxy
- Explicit error surfacing (no silent success)

Cockpit is not the authority.
Cockpit is not enforcement.
Cockpit is not the brain.

---

# 4. Data Model

Primary tables:

## tasks
- id
- title
- board (TitleCase)
- state (UPPER)
- type
- priority
- owner
- executor
- gate
- override metadata
- DoD checklist
- timestamps

## activities
- taskId
- actor
- action
- ok (boolean)
- message
- meta
- timestamp

## agents
- name
- role
- status

## documents
- linked artifacts
- runbooks
- policy references

---

# 5. Security Model

## 5.1 Trust Boundary

The trust boundary is the Convex runtime. No component bypasses it.

## 5.2 Secret Handling

- X-MC-SECRET exists only in server environment variables.
- Never exposed to browser bundle.
- Never logged.

## 5.3 Fail-Closed Design

If:
- WIP exceeded
- Gate invalid
- Approver invalid
- DoD missing

→ Action rejected explicitly. No silent fallback.

---

# 6. Execution Flow

Strategy (Founder)
↓
Jarvis translates to tasks
↓
Specialists execute
↓
Convex enforces
↓
Cockpit visualizes
↓
Founder reviews

---

# 7. Extension Model

Future expansions may include:
- Real approval-pending query endpoint
- Multi-product portfolio scaling
- External API integration
- Productization of Cockpit
- Multi-user role-based access

However: Core enforcement must remain isolated.

---

# 8. Non-Goals (Explicit)

Mission Control is NOT:
- A CRM
- A general project manager
- A no-code platform
- A public SaaS (yet)

It is:
- The internal operating system of the startup.

---

# End of Document
