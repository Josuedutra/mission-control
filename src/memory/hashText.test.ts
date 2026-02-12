import { hashText, hmacText } from "./hashText";

describe("hashText/hmacText", () => {
  test("hashText returns sha256 hex", () => {
    const h = hashText("hello");
    expect(h).toMatch(/^[a-f0-9]{64}$/);
  });

  test("hmacText is deterministic for same input+secret", () => {
    const a = hmacText("hello", "secret");
    const b = hmacText("hello", "secret");
    expect(a).toBe(b);
    expect(a).toMatch(/^[a-f0-9]{64}$/);
  });
});
