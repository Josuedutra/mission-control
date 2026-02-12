import { embedWithGuard } from "./embedGuard";

describe("embedWithGuard", () => {
  test("DENY and never call provider on Level 3", async () => {
    const embedFn = jest.fn(async () => ({}));
    const res = await embedWithGuard({ text: "Email: x@y.com" }, embedFn);

    expect(res.status).toBe("DENY");
    expect(res.reason).toBe("LEVEL_3_PROHIBITED");
    expect(embedFn).not.toHaveBeenCalled();
  });

  test("OK calls provider for safe text", async () => {
    const embedFn = jest.fn(async () => ({}));
    const res = await embedWithGuard({ text: "Runbook: rollback steps", metadata: { source: "internal" } }, embedFn);

    expect(res.status).toBe("OK");
    expect(embedFn).toHaveBeenCalledTimes(1);
  });

  test("DENY logs do not include raw text", async () => {
    const spy = jest.spyOn(console, "warn").mockImplementation(() => undefined);
    const embedFn = jest.fn(async () => ({}));

    await embedWithGuard({ text: "Email: x@y.com" }, embedFn);

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
