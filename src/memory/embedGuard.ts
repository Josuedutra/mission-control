import { classifyMemory, ClassifyMetadata } from "./classify";
import { sanitizeForEmbedding } from "./sanitize";
import { hashText } from "./hashText";

export type EmbedInput = {
  text: string;
  metadata?: ClassifyMetadata;
};

export function logDeny(reason: string, text: string, meta?: ClassifyMetadata) {
  const hash = hashText(text);
  console.warn("MEMORY_EMBED_DENY", {
    reason,
    hash,
    source: meta?.source,
    tenantId: meta?.tenantId ? "[PRESENT]" : undefined,
    ts: new Date().toISOString()
  });
}

export async function embedWithGuard(
  input: EmbedInput,
  embedFn: (sanitizedText: string, meta?: ClassifyMetadata) => Promise<unknown>
): Promise<{ status: "DENY" | "OK"; reason?: string }> {
  const level = classifyMemory(input.text, input.metadata);
  if (level === 3) {
    logDeny("LEVEL_3_PROHIBITED", input.text, input.metadata);
    return { status: "DENY", reason: "LEVEL_3_PROHIBITED" };
  }

  const { sanitizedText, report } = sanitizeForEmbedding(input.text);
  if (report.failed) {
    logDeny("REDACTION_FAILED", input.text, input.metadata);
    return { status: "DENY", reason: "REDACTION_FAILED" };
  }

  await embedFn(sanitizedText, input.metadata);
  return { status: "OK" };
}
