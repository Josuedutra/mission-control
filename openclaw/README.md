# OpenClaw (Repo-Managed Workspaces)

This folder mirrors the workspace layout recommended by the OpenClaw guide, but **versioned inside the repository** (no secrets).

## Convention

- `openclaw/AGENTS.md` — shared operating manual (read by all agents)
- `openclaw/workspaces/<agent>/SOUL.md` — per-agent identity/boundaries
- `openclaw/workspaces/<agent>/memory/` — per-agent persistence (daily notes, WORKING.md)
- `openclaw/workspaces/<agent>/scripts/` — utilities
- `openclaw/workspaces/<agent>/config/` — local configs/credentials (gitignored)

Naming note:
- Paths normalize the sessionKey (no `:` in directories), e.g. `agent_product_main`.
- The real OpenClaw session key remains in runtime config (openclaw.json).

## Repo config

- `openclaw/openclaw.json` is a **repo-managed** config template aligned with `openclaw/workspaces/*`.
- It intentionally contains **no secrets** (channels/gateway tokens belong in local config outside git).
