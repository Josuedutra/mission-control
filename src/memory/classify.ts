export type MemoryLevel = 0 | 1 | 2 | 3;

export type ClassifyMetadata = {
  source?: "public" | "internal" | "confidential" | "customer" | "ingestion" | "logs";
  containsClientData?: boolean;
  tenantId?: string | null;
  tags?: string[];
};

const EMAIL_RE = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const IBAN_RE = /\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/i;
const TOKEN_RE = /\b(sk-|rk-|pk_|bearer\s+)[A-Za-z0-9._-]{10,}\b/i;
const NIF_RE = /\b\d{9}\b/;
const PHONE_RE = /\b(\+?\d{1,3}[-.\s]?)?(\(?\d{2,4}\)?[-.\s]?)?\d{6,10}\b/;

function hasTag(meta: ClassifyMetadata | undefined, tag: string) {
  return !!meta?.tags?.some((t) => t.toLowerCase() === tag.toLowerCase());
}

export function classifyMemory(text: string, meta?: ClassifyMetadata): MemoryLevel {
  const t = (text ?? "").trim();

  if (meta?.containsClientData === true) return 3;
  if (meta?.source === "customer" || meta?.source === "ingestion" || meta?.source === "logs") {
    if (t.length > 0) return 3;
  }
  if (hasTag(meta, "pii") || hasTag(meta, "bcc")) return 3;

  let score3 = 0;
  if (EMAIL_RE.test(t)) score3 += 3;
  if (IBAN_RE.test(t)) score3 += 3;
  if (TOKEN_RE.test(t)) score3 += 3;

  if (/\b(api[_-]?key|secret|password|token)\b/i.test(t)) score3 += 2;
  if (/webhook/i.test(t) && /\b(payload|signature|event|stripe|ifthenpay)\b/i.test(t)) score3 += 2;

  const weak = (NIF_RE.test(t) ? 1 : 0) + (PHONE_RE.test(t) ? 1 : 0);
  score3 += weak;
  if (meta?.tenantId && weak > 0) score3 += 1;

  if (score3 >= 3) return 3;

  if (meta?.source === "confidential") return 2;
  if (/\b(pricing|forecast|projection|revenue|mrr|arr|unit economics)\b/i.test(t)) return 2;

  if (meta?.source === "internal") return 1;
  if (/\b(runbook|decision|risk_register|postmortem|incident|sla|gate)\b/i.test(t)) return 1;

  return 0;
}
