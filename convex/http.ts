import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

function requireMcSecret(req: Request): Response | null {
  const expected = process.env.MC_HTTP_SECRET;
  if (!expected) {
    return new Response("MC_HTTP_SECRET not configured", { status: 500 });
  }
  const got = req.headers.get("x-mc-secret");
  if (!got || got !== expected) {
    return new Response("Unauthorized", { status: 401 });
  }
  return null;
}

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
  path: "/tasks/create",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const unauthorized = requireMcSecret(req);
    if (unauthorized) return unauthorized;

    const body = await req.json();
    const {
      title,
      description,
      board,
      product,
      domain,
      type,
      priority,
      owner,
      gate,
      evidenceRequired,
      slaClass,
      riskScore,
    } = body ?? {};

    const id = await ctx.runMutation(api.tasks.create, {
      title,
      description,
      board,
      product,
      domain,
      type,
      priority,
      owner,
      gate,
      evidenceRequired,
      slaClass,
      riskScore,
    });

    return new Response(JSON.stringify({ ok: true, id }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }),
});

http.route({
  path: "/tasks/transition",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const unauthorized = requireMcSecret(req);
    if (unauthorized) return unauthorized;

    const body = await req.json();
    const { id, to, actor } = body ?? {};
    const res = await ctx.runMutation(api.tasks.transition, { id, to, actor });
    return new Response(JSON.stringify(res), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }),
});

http.route({
  path: "/tasks/approve",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const unauthorized = requireMcSecret(req);
    if (unauthorized) return unauthorized;

    const body = await req.json();
    const { id, gate, actor, evidenceLink, notes } = body ?? {};
    const res = await ctx.runMutation(api.tasks.approveGate, { id, gate, actor, evidenceLink, notes });
    return new Response(JSON.stringify(res), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }),
});

http.route({
  path: "/tasks/override",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const unauthorized = requireMcSecret(req);
    if (unauthorized) return unauthorized;

    const body = await req.json();
    const { id, actor, reason, acceptedRisk, reviewDeadlineIso } = body ?? {};
    const res = await ctx.runMutation(api.override.overrideGate, { id, actor, reason, acceptedRisk, reviewDeadlineIso });
    return new Response(JSON.stringify(res), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }),
});

export default http;
