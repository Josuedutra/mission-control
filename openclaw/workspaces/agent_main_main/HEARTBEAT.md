# HEARTBEAT.md — Mission Control Checklists

## General Heartbeat Rules
- Perform cheap validation first.
- If no action required, return `HEARTBEAT_OK`.
- Never trigger heavy operations without change detection.

## Coordinator Heartbeat (15–30m)
- Check blocked tasks.
- Check overdue approvals.
- Validate WIP limits.
- Surface decisions needed.

## Developer Heartbeat (15–30m)
- Check CI status.
- Check error logs.
- Validate open P0 bugs.
- Confirm environment health.

## Security Heartbeat (15–30m)
- Scan recent commits for auth/payment changes.
- Check log anomalies.
- Verify rate-limit integrity.
- Confirm webhook validation intact.

## RevOps Heartbeat (30m)
- Check payment reconciliation delta.
- Monitor churn anomalies.
- Validate subscription state consistency.

## QA Heartbeat (30–60m)
- Check regression checklist completeness.
- Validate acceptance criteria coverage.

## Documentation Heartbeat (60m)
- Identify tasks missing documentation.
- Check decision log updates.

## Growth / Research / Lifecycle / Design (60–120m or on-demand)
- Review active campaigns.
- Check content requiring claims gate.
- Validate messaging alignment.
