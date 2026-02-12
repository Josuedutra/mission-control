import { sanitizeForEmbedding } from "./sanitize";

describe("sanitizeForEmbedding", () => {
  test("redacts email + token normally", () => {
    const input = "Email: a@b.com key=sk-1234567890abcdef";
    const { sanitizedText, report } = sanitizeForEmbedding(input);

    expect(sanitizedText).toContain("[REDACTED_EMAIL]");
    expect(sanitizedText).toContain("[REDACTED_TOKEN]");
    expect(report.failed).toBe(false);
    expect(report.removed.map((r) => r.label)).toEqual(expect.arrayContaining(["email", "token"]));
  });

  test("fails closed if rules are incomplete (simulated regression)", () => {
    const input = "Email: a@b.com token=sk-1234567890abcdef";

    const rulesOverride = [
      {
        label: "email",
        re: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
        replacement: "[REDACTED_EMAIL]"
      }
    ];

    const { report } = sanitizeForEmbedding(input, { rulesOverride });
    expect(report.failed).toBe(true);
    expect(report.reasons).toEqual(expect.arrayContaining(["TOKEN_NOT_REDACTED"]));
  });

  test("redacts IBAN and NIF", () => {
    const input = "IBAN PT50000201231234567890154 NIF 123456789";
    const { sanitizedText, report } = sanitizeForEmbedding(input);
    expect(sanitizedText).toContain("[REDACTED_IBAN]");
    expect(sanitizedText).toContain("[REDACTED_NIF]");
    expect(report.failed).toBe(false);
  });

  test("safe text keeps failed=false and no reasons", () => {
    const { report } = sanitizeForEmbedding("runbook operational note");
    expect(report.failed).toBe(false);
    expect(report.reasons).toBeUndefined();
  });

  test("flags EMAIL_NOT_REDACTED when no rules are provided", () => {
    const { report } = sanitizeForEmbedding("Contact me: a@b.com", { rulesOverride: [] });
    expect(report.failed).toBe(true);
    expect(report.reasons).toEqual(expect.arrayContaining(["EMAIL_NOT_REDACTED"]));
  });

  test("flags IBAN_NOT_REDACTED when iban rule is missing", () => {
    const rulesOverride = [
      {
        label: "email",
        re: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
        replacement: "[REDACTED_EMAIL]"
      }
    ];
    const { report } = sanitizeForEmbedding("IBAN PT50000201231234567890154", { rulesOverride });
    expect(report.failed).toBe(true);
    expect(report.reasons).toEqual(expect.arrayContaining(["IBAN_NOT_REDACTED"]));
  });
});
