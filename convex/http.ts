import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// Minimal health endpoint
http.route({
  path: "/health",
  method: "GET",
  handler: httpAction(async () => {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }),
});

// Example: transition task via HTTP (for gateway integration). Auth TBD.
http.route({
  path: "/tasks/transition",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const body = await req.json();
    const { id, to, actor } = body ?? {};
    const res = await ctx.runMutation(api.tasks.transition, { id, to, actor });
    return new Response(JSON.stringify(res), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }),
});

export default http;
