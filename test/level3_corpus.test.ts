import fs from "node:fs";
import path from "node:path";
import { embedWithGuard } from "../src/memory/embedGuard";

test("Level 3 corpus must always be denied", async () => {
  const file = path.join(__dirname, "fixtures/level3_corpus.txt");
  const corpus = fs
    .readFileSync(file, "utf-8")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const embedFn = jest.fn(async () => ({}));

  for (const line of corpus) {
    const res = await embedWithGuard({ text: line }, embedFn);
    expect(res.status).toBe("DENY");
  }

  expect(embedFn).not.toHaveBeenCalled();
});
