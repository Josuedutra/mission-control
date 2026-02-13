# POLICY_CHANGE_PROCESS.md — Controlled Evolution Process

**Version:** 1.0  
**Owner:** Founder

---

# 1. Purpose

This document defines how runtime policies may be changed.

Policies include:
- WIP limits
- Gate definitions
- Approver assignments
- Security baseline
- Memory handling policy
- Override rules
- Enforcement logic

Unauthorized mutation of these policies is prohibited.

---

# 2. Change Categories

## Minor (Non-Structural)

Examples:
- UI improvements
- Read-only query additions
- New dashboard widgets

Process:
- Jarvis creates TRIAGED ticket
- Execute normally

## Moderate (Policy Adjacent)

Examples:
- New read-only approval query
- New reporting endpoint
- Additional audit log

Process:
- Proposal ticket required
- Founder review required
- Approval documented in activities

## Structural (Core Policy)

Examples:
- Changing WIP limits
- Changing gate authority
- Modifying override logic
- Changing memory guard policy

Process:
1) Create proposal ticket (type=OPS, priority=P0/P1)
2) Include:
   - Rationale
   - Risk analysis
   - Rollback plan
3) Founder approval required
4) Change implemented
5) Tabletop drill if security-sensitive
6) Evidence attached

No structural change may be implemented without explicit Founder approval.

---

# 3. Emergency Changes

If security or tenant isolation risk is detected:
- Stop-the-line
- Patch immediately
- Document change after stabilization
- Run tabletop review within 48h

---

# 4. Audit Requirements

Every policy change must:
- Reference commit SHA
- Reference proposal ticket
- Be logged in activities
- Update ARCHITECTURE.md if needed

---

# 5. Drift Control

Jarvis must:
- Periodically verify runtime rules match documented policy.
- Raise alert if divergence detected.

---

# End of Document
