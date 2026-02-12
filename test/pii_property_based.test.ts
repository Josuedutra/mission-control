import fc from "fast-check";
import { embedWithGuard } from "../src/memory/embedGuard";

describe("property-based: PII-like patterns must never be indexed", () => {
  test("emails always denied + provider never called", async () => {
    const embedFn = jest.fn(async () => ({}));
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => undefined);

    await fc.assert(
      fc.asyncProperty(
        fc.record({
          userHead: fc.char().filter((c) => /[a-zA-Z0-9]/.test(c)),
          userTail: fc.stringMatching(/^[a-zA-Z0-9._%+-]{0,19}$/),
          domainHead: fc.char().filter((c) => /[a-zA-Z0-9]/.test(c)),
          domainTail: fc.stringMatching(/^[a-zA-Z0-9.-]{0,19}$/),
          tld: fc.constantFrom("com", "pt", "io", "net", "org")
        }),
        async ({ userHead, userTail, domainHead, domainTail, tld }) => {
          const user = `${userHead}${userTail}`;
          const domain = `${domainHead}${domainTail}`;
          const text = `Contact ${user}@${domain}.${tld} for details`;
          const res = await embedWithGuard({ text }, embedFn);
          expect(res.status).toBe("DENY");
        }
      ),
      { numRuns: 50 }
    );

    expect(embedFn).not.toHaveBeenCalled();
    for (const call of warnSpy.mock.calls) {
      const payload = call[1];
      if (payload) expect(JSON.stringify(payload)).not.toContain("@");
    }

    warnSpy.mockRestore();
  });

  test("tokens always denied + provider never called", async () => {
    const embedFn = jest.fn(async () => ({}));
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => undefined);

    await fc.assert(
      fc.asyncProperty(fc.hexaString({ minLength: 20, maxLength: 60 }), async (hex) => {
        const text = `OPENAI_API_KEY=sk-${hex}`;
        const res = await embedWithGuard({ text }, embedFn);
        expect(res.status).toBe("DENY");
      }),
      { numRuns: 50 }
    );

    expect(embedFn).not.toHaveBeenCalled();
    for (const call of warnSpy.mock.calls) {
      const payload = call[1];
      if (payload) expect(JSON.stringify(payload)).not.toContain("sk-");
    }

    warnSpy.mockRestore();
  });
});
