import { classifyMemory } from "./classify";

describe("classifyMemory", () => {
  test("Level 3 for obvious PII", () => {
    expect(classifyMemory("Contact: joao.silva@empresa.pt")).toBe(3);
    expect(classifyMemory("OPENAI_API_KEY=sk-1234567890abcdef")).toBe(3);
    expect(classifyMemory("Stripe webhook payload signature=...")).toBe(3);
  });

  test("metadata can force Level 3 in ingestion/customer contexts", () => {
    expect(classifyMemory("Some text", { source: "customer" })).toBe(3);
    expect(classifyMemory("Some text", { source: "ingestion" })).toBe(3);
  });

  test("reduces overflag by requiring threshold for weak heuristics", () => {
    expect(classifyMemory("The code is 123456789")).not.toBe(3);
    expect(classifyMemory("NIF 123456789", { tenantId: "t1" })).toBe(3);
  });

  test("Level 1 operational docs", () => {
    expect(classifyMemory("Runbook: rollback steps", { source: "internal" })).toBe(1);
  });

  test("Level 2 finance strategy", () => {
    expect(classifyMemory("MRR projection and pricing strategy")).toBe(2);
  });

  test("metadata tags and containsClientData force Level 3", () => {
    expect(classifyMemory("safe", { containsClientData: true })).toBe(3);
    expect(classifyMemory("safe", { tags: ["bcc"] })).toBe(3);
  });

  test("confidential source returns Level 2", () => {
    expect(classifyMemory("generic", { source: "confidential" })).toBe(2);
  });

  test("default public text returns Level 0", () => {
    expect(classifyMemory("hello world", { source: "public" })).toBe(0);
  });
});
