import { embedWithGuard } from "./embedGuard";
import { ClassifyMetadata } from "./classify";

export class MemoryIndexService {
  constructor(private readonly providerEmbed: (text: string) => Promise<unknown>) {}

  async index(text: string, metadata?: ClassifyMetadata) {
    return embedWithGuard({ text, metadata }, async (sanitizedText) => {
      return this.providerEmbed(sanitizedText);
    });
  }
}
