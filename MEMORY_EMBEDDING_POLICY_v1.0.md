# Memory Handling & Embedding Policy v1.0

## 1. Purpose

This policy defines how conversational memory, documents, and embeddings are generated, stored, indexed, transmitted, and governed within the OpenClaw-based Mission Control OS.

Objectives:
- Preserve operational intelligence
- Prevent sensitive data leakage
- Maintain multi-tenant isolation
- Control cost and exposure when using external embedding providers

---

## 2. Memory Classification

### Level 0 — Public / Non-Sensitive
Examples:
- Marketing copy
- Public documentation
- Product specs without client data

Embedding: ✅ Allowed

### Level 1 — Internal Operational
Examples:
- Backlog tasks
- Runbooks
- Decisions
- Risk register

Embedding: ✅ Allowed (with light sanitization)

### Level 2 — Confidential Business
Examples:
- Pricing strategy drafts
- Financial projections
- Partnership negotiations

Embedding: ⚠ Allowed only after redaction of financial identifiers

### Level 3 — Sensitive / Regulated (STRICT)
Examples:
- Client PII
- Emails (BCC content)
- Payment identifiers
- Access tokens
- Tenant-specific data

Embedding: ❌ Prohibited

---

## 3. Redaction Requirements

Before sending any content to an external embedding provider, automatically remove:
- Email addresses
- Phone numbers
- NIF/Tax IDs
- IBAN/Bank data
- Tokens/API keys
- Internal database IDs
- Raw webhook payloads

If redaction fails: **fail closed** (do not embed).

---

## 4. Multi-Tenant Protection

- Embeddings must never mix tenant data.
- Each tenant context must be isolated at indexing time.
- Cross-tenant search queries are prohibited.
- Embedding index must include `tenant_id` scoping where applicable.

---

## 5. Provider Governance

### External Provider Rules
- API key must be stored only as environment variable.
- Never commit API keys to repository.
- Provider configuration must not contain secrets.
- Rotate API key periodically.

### Approved Models (Bootstrapped Mode)
- Default: `text-embedding-3-small`
- Escalation: larger models only if semantic accuracy materially impacts operations.

---

## 6. Storage & Retention

- Session logs stored locally must follow least-privilege permissions.
- No raw production PII stored in searchable memory.
- Memory files can be version-controlled excluding secrets.
- Retention policy:
  - Operational memory: retained
  - Sensitive artifacts: archived offline

---

## 7. Cost Control Rules

- Default embedding chunk size capped (e.g., 1000 tokens).
- Do not re-embed unchanged documents.
- Heartbeat must not trigger re-indexing.
- Embedding usage reviewed weekly.

---

## 8. Incident Protocol (Memory Breach Scenario)

If suspected leakage:
1. Disable memorySearch immediately.
2. Rotate embedding API key.
3. Identify affected documents.
4. Log incident in `RISK_REGISTER.md`.
5. Conduct tabletop review.

---

## 9. Governance & Authority

- Security Agent (Sentinel) owns this policy.
- Any override requires Founder approval and must generate follow-up audit task.
- Policy reviewed quarterly or after any production incident.

---

## 10. Default Configuration Principle

> "Embed structure, never embed secrets."

Memory is for operational intelligence, not raw data storage.
