import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { validateTransition } from "./policy";

const Gate = v.union(
  v.literal("None"),
  v.literal("Security"),
  v.literal("RevOps"),
  v.literal("Claims"),
  v.literal("Product"),
);

const State = v.union(
  v.literal("INBOX"),
  v.literal("TRIAGED"),
  v.literal("READY"),
  v.literal("DOING"),
  v.literal("REVIEW"),
  v.literal("APPROVAL"),
  v.literal("DONE"),
  v.literal("BLOCKED"),
);

export const get = query({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const t = await ctx.db.get(args.id);
    if (!t) return null;
    return t;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    board: v.union(v.literal("Inbox"), v.literal("Company"), v.literal("Ritmo"), v.literal("Factory"), v.literal("Portfolio")),
    product: v.string(),
    domain: v.string(),
    type: v.union(
      v.literal("EPIC"), v.literal("FEATURE"), v.literal("BUG"), v.literal("SECURITY"), v.literal("REVOPS"),
      v.literal("OPS"), v.literal("RESEARCH"), v.literal("CONTENT"), v.literal("DOC"), v.literal("INCIDENT"),
    ),
    priority: v.union(v.literal("P0"), v.literal("P1"), v.literal("P2"), v.literal("P3")),
    owner: v.string(),
    executor: v.optional(v.string()),
    gate: Gate,
    evidenceRequired: v.boolean(),
    slaClass: v.union(v.literal("none"), v.literal("standard"), v.literal("urgent"), v.literal("incident")),
    riskScore: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const id = await ctx.db.insert("tasks", {
      title: args.title,
      description: args.description,
      board: args.board,
      product: args.product,
      domain: args.domain,
      type: args.type,
      priority: args.priority,
      state: "INBOX",
      owner: args.owner,
      executor: args.owner,
      gate: args.gate,
      evidenceRequired: args.evidenceRequired,
      slaClass: args.slaClass,
      riskScore: args.riskScore,
      dodChecklist: [],
      approvals: [],
      createdAt: now,
      updatedAt: now,
    });

    await ctx.runMutation(internal.activity.log, {
      taskId: id,
      actor: args.owner,
      action: "TASK_CREATED",
      ok: true,
      meta: { title: args.title, board: args.board, product: args.product, type: args.type, priority: args.priority },
    });

    return id;
  },
});

export const transition = mutation({
  args: {
    id: v.id("tasks"),
    to: State,
    actor: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const t = await ctx.db.get(args.id);
    if (!t) throw new Error("TASK_NOT_FOUND");

    const res = validateTransition(t.state, args.to, t as any);
    if (!res.ok) {
      await ctx.db.insert("activities", {
        type: "task_transition_denied",
        agent: args.actor,
        taskId: args.id,
        message: `Denied transition ${t.state} -> ${args.to}: ${res.errors.join(",")}`,
        createdAt: now,
      });
      throw new Error(`TRANSITION_DENIED:${res.errors.join(",")}`);
    }

    await ctx.db.patch(args.id, { state: args.to, updatedAt: now });
    await ctx.db.insert("activities", {
      type: "task_transition",
      agent: args.actor,
      taskId: args.id,
      message: `Transition ${t.state} -> ${args.to}`,
      createdAt: now,
    });

    return { ok: true };
  },
});

import { internal } from "./_generated/api";
import { requireApprover, requireApproverNotExecutor, GateType } from "./gates";

export const approveGate = mutation({
  args: {
    id: v.id("tasks"),
    gate: Gate,
    actor: v.string(),
    evidenceLink: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const t = await ctx.db.get(args.id);
    if (!t) throw new Error("TASK_NOT_FOUND");

    await ctx.runMutation(internal.activity.log, {
      taskId: args.id,
      actor: args.actor,
      action: "GATE_APPROVE_ATTEMPT",
      ok: true,
      meta: { gate: args.gate },
    });

    try {
      if (args.gate !== "None") requireApprover(args.gate as GateType, args.actor);
      requireApproverNotExecutor(args.actor, t.executor);

      const already = (t.approvals ?? []).some((a: any) => a.gate === args.gate);
      if (already) throw new Error("CONFLICT_GATE_ALREADY_APPROVED");

      const approvals = [
        ...t.approvals,
        {
          gate: args.gate,
          approvedBy: args.actor,
          timestampUtc: now,
          evidenceLink: args.evidenceLink,
          notes: args.notes,
        },
      ];

      await ctx.db.patch(args.id, { approvals, updatedAt: now });
      await ctx.runMutation(internal.activity.log, {
        taskId: args.id,
        actor: args.actor,
        action: "GATE_APPROVED",
        ok: true,
        meta: { gate: args.gate },
      });

      return { ok: true };
    } catch (e: any) {
      await ctx.runMutation(internal.activity.log, {
        taskId: args.id,
        actor: args.actor,
        action: "GATE_APPROVED",
        ok: false,
        message: e?.message ?? String(e),
        meta: { gate: args.gate },
      });
      throw e;
    }
  },
});
