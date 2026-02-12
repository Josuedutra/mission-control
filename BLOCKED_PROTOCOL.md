# BLOCKED_PROTOCOL.md — Blocker Handling Standard (v1)

## Definition of BLOCKED
A task is BLOCKED only if progress cannot continue due to:
- External dependency (vendor, legal, approval, infra access)
- Missing required decision from accountable owner
- Missing mandatory gate

## Not BLOCKED (invalid use)
- “Needs more thought” without specific dependency
- Owner context switching
- Lack of prioritization discipline

## Mandatory Fields when BLOCKED
- blocker_type
- blocker_owner
- unblock_action
- expected_unblock_date
- escalation_level

## Escalation Timers
- P0/P1 blockers: escalate in <= 30 min
- P2 blockers: escalate in <= 4h
- P3 blockers: escalate in <= 1 business day

## Coordinator Rule
Coordinator must surface all overdue blockers at each heartbeat and standup.
