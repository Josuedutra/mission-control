export type RedactionReport = {
  removed: Array<{ label: string; count: number }>;
  failed: boolean;
  reasons?: string[];
};

type Rule = {
  label: string;
  re: RegExp;
  replacement: string;
};

const RULES: Rule[] = [
  { label: "email", re: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, replacement: "[REDACTED_EMAIL]" },
  { label: "iban", re: /\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/gi, replacement: "[REDACTED_IBAN]" },
  { label: "nif", re: /\b\d{9}\b/g, replacement: "[REDACTED_NIF]" },
  { label: "token", re: /\b(sk-|rk-|pk_|bearer\s+)[A-Za-z0-9._-]{10,}\b/gi, replacement: "[REDACTED_TOKEN]" }
];

export function sanitizeForEmbedding(
  text: string,
  opts?: { rulesOverride?: Rule[] }
): { sanitizedText: string; report: RedactionReport } {
  const rules = opts?.rulesOverride ?? RULES;
  const removed: Array<{ label: string; count: number }> = [];
  const reasons: string[] = [];
  let out = text ?? "";

  for (const rule of rules) {
    const before = out;
    out = out.replace(rule.re, rule.replacement);

    const token = rule.replacement;
    const count = out.split(token).length - 1 - (before.split(token).length - 1);
    if (count > 0) removed.push({ label: rule.label, count });
  }

  const stillEmail = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(out);
  const stillIban = /\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/i.test(out);
  const stillToken = /\b(sk-|rk-|pk_|bearer\s+)/i.test(out);

  if (stillEmail) reasons.push("EMAIL_NOT_REDACTED");
  if (stillIban) reasons.push("IBAN_NOT_REDACTED");
  if (stillToken) reasons.push("TOKEN_NOT_REDACTED");

  const failed = reasons.length > 0;
  return {
    sanitizedText: out,
    report: { removed, failed, reasons: failed ? reasons : undefined }
  };
}
