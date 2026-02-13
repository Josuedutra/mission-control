import { z } from 'zod';

const Env = z.object({
  MC_CONVEX_SITE_URL: z.string().url(),
  MC_HTTP_SECRET: z.string().min(1),
});

function env() {
  const parsed = Env.safeParse({
    MC_CONVEX_SITE_URL: process.env.MC_CONVEX_SITE_URL,
    MC_HTTP_SECRET: process.env.MC_HTTP_SECRET,
  });
  if (!parsed.success) {
    // Fail-closed with a clear error.
    throw new Error(
      `SERVER_MISCONFIGURED: ${parsed.error.issues.map((i) => i.path.join('.') + ' ' + i.message).join('; ')}`,
    );
  }
  return parsed.data;
}

export async function mcPost<T>(path: string, body: unknown): Promise<T> {
  const { MC_CONVEX_SITE_URL, MC_HTTP_SECRET } = env();

  const ctrl = new AbortController();
  const timeoutMs = 10_000;
  const t = setTimeout(() => ctrl.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(`${MC_CONVEX_SITE_URL}${path}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-mc-secret': MC_HTTP_SECRET,
      },
      body: JSON.stringify(body),
      cache: 'no-store',
      signal: ctrl.signal,
    });
  } catch (e: any) {
    if (e?.name === 'AbortError') {
      throw new Error('UPSTREAM_TIMEOUT');
    }
    throw new Error(`UPSTREAM_ERROR: ${e?.message ?? 'UNKNOWN'}`);
  } finally {
    clearTimeout(t);
  }

  const text = await res.text();
  if (!res.ok) {
    // Surface backend errors verbosely to the UI.
    throw new Error(`MC_HTTP_${res.status}: ${text || res.statusText}`);
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`MC_BAD_JSON: ${text.slice(0, 400)}`);
  }
}
