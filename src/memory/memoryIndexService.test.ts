import { MemoryIndexService } from "./memoryIndexService";

describe("MemoryIndexService", () => {
  test("indexes safe text through provider", async () => {
    const provider = jest.fn(async () => ({}));
    const svc = new MemoryIndexService(provider);

    const res = await svc.index("Runbook: rollback steps", { source: "internal" });
    expect(res.status).toBe("OK");
    expect(provider).toHaveBeenCalledTimes(1);
  });

  test("denies Level 3 text and does not call provider", async () => {
    const provider = jest.fn(async () => ({}));
    const svc = new MemoryIndexService(provider);

    const res = await svc.index("Contact: user@example.com");
    expect(res.status).toBe("DENY");
    expect(provider).not.toHaveBeenCalled();
  });
});
