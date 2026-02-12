# CHANGE_POLICY.md — Change & Release Controls (v1)

## Change Classes
- **Standard:** low-risk, reversible, tested.
- **High-risk:** auth, payments, tenant isolation, data migrations.
- **Emergency:** active incident mitigation.

## Required Controls
- Standard:
  - PR + tests + reviewer
- High-risk:
  - PR + tests + reviewer + required Gate (Security/RevOps/Product)
  - Rollback plan mandatory
  - Monitoring checks defined
- Emergency:
  - Fast-track allowed
  - Must open incident + follow-up postmortem + retroactive gate review

## Release Window
- Prefer business hours in founder timezone.
- Avoid high-risk releases near end-of-day/weekend unless incident-driven.

## Rollback Rule
No high-risk change without:
- rollback steps
- owner on-call
- success/failure signal definition

## Production Data Rule
- Never run destructive commands without explicit Founder approval.
- Mask/avoid PII in logs and debug dumps.
