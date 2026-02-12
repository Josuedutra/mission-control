import { embedWithGuard } from "./embedGuard";

describe("embedWithGuard", () => {
  test("DENY and never call provider on Level 3", async () => {
    const spy = jest.spyOn(console, "warn").mockImplementation(() => undefined);
    const embedFn = jest.fn(async () => ({}));
    const res = await embedWithGuard({ text: "Email: x@y.com" }, embedFn);

    expect(res.status).toBe("DENY");
    expect(res.reason).toBe("LEVEL_3_PROHIBITED");
    expect(embedFn).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  test("OK calls provider for safe text", async () => {
    const embedFn = jest.fn(async () => ({}));
    const res = await embedWithGuard({ text: "Runbook: rollback steps", metadata: { source: "internal" } }, embedFn);

    expect(res.status).toBe("OK");
    expect(embedFn).toHaveBeenCalledTimes(1);
  });

  test("DENY on redaction failure via injected sanitizer", async () => {
    const spy = jest.spyOn(console, "warn").mockImplementation(() => undefined);
    const embedFn = jest.fn(async () => ({}));

    const sanitizeFn = () => ({
      sanitizedText: "x",
      report: { removed: [], failed: true as const, reasons: ["TOKEN_NOT_REDACTED"] }
    });

    const res = await embedWithGuard(
      { text: "runbook note", metadata: { source: "internal" } },
      embedFn,
      { sanitizeFn: sanitizeFn as any }
    );

    expect(res.status).toBe("DENY");
    expect(res.reason).toBe("REDACTION_FAILED");
    expect(embedFn).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  test("DENY logs do not include raw text", async () => {
    const spy = jest.spyOn(console, "warn").mockImplementation(() => undefined);
    const embedFn = jest.fn(async () => ({}));

    await embedWithGuard({ text: "Email: x@y.com", metadata: { tenantId: "t1", source: "customer" } }, embedFn);

    expect(spy).toHaveBeenCalledWith(
      "MEMORY_EMBED_DENY",
      expect.objectContaining({
        reason: expect.any(String),
        hash: expect.stringMatching(/^[a-f0-9]{64}$/)
      })
    );

    const payload = spy.mock.calls[0][1];
    expect(JSON.stringify(payload)).not.toContain("x@y.com");

    spy.mockRestore();
  });
});
