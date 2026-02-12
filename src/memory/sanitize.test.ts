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
});
