import crypto from "node:crypto";

export function hashText(text: string): string {
  return crypto.createHash("sha256").update(text, "utf8").digest("hex");
}

export function hmacText(text: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(text, "utf8").digest("hex");
}
