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
      executor: args.executor ?? args.owner,
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

async function enforceWipOnDoing(ctx: any, task: any) {
  // Global WIP: total DOING <= 6
  const globalDoing = await ctx.db.query("tasks").withIndex("by_state", (q: any) => q.eq("state", "DOING")).collect();
  if (globalDoing.length >= 6) return "WIP_LIMIT_GLOBAL_DOING_MAX_6";

  // Board WIP: Ritmo DOING <= 3
  if (task.board === "Ritmo") {
    const boardDoing = await ctx.db
      .query("tasks")
      .withIndex("by_board", (q: any) => q.eq("board", task.board).eq("state", "DOING"))
      .collect();
    if (boardDoing.length >= 3) return "WIP_LIMIT_RITMO_DOING_MAX_3";
  }

  // Executor WIP: each executor DOING <= 2
  const execDoing = await ctx.db
    .query("tasks")
    .filter((q: any) => q.eq(q.field("executor"), task.executor).eq(q.field("state"), "DOING"))
    .collect();
  if (execDoing.length >= 2) return "WIP_LIMIT_EXECUTOR_DOING_MAX_2";

  return null;
}

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

    if (args.to === "DOING") {
      const wipErr = await enforceWipOnDoing(ctx, t);
      if (wipErr) {
        await ctx.db.insert("activities", {
          type: "task_transition_denied",
          agent: args.actor,
          taskId: args.id,
          message: `Denied transition ${t.state} -> ${args.to}: ${wipErr}`,
          createdAt: now,
        });
        throw new Error(`TRANSITION_DENIED:${wipErr}`);
      }
    }

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

export const startDoing = mutation({
  args: {
    id: v.id("tasks"),
    actor: v.string(),
    // Optional: set DoD checklist if empty
    dodIfEmpty: v.optional(
      v.array(
        v.object({
          label: v.string(),
          done: v.boolean(),
        }),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const t = await ctx.db.get(args.id);
    if (!t) throw new Error("TASK_NOT_FOUND");

    // Seed DoD if empty and provided
    if ((t.dodChecklist?.length ?? 0) === 0 && args.dodIfEmpty && args.dodIfEmpty.length > 0) {
      await ctx.db.patch(args.id, { dodChecklist: args.dodIfEmpty, updatedAt: now });
      await ctx.db.insert("activities", {
        type: "dod_seeded",
        agent: args.actor,
        taskId: args.id,
        message: `Seeded DoD checklist (${args.dodIfEmpty.length})`,
        createdAt: now,
      });
    }

    // Re-read (in case we patched)
    const t2 = await ctx.db.get(args.id);
    if (!t2) throw new Error("TASK_NOT_FOUND");

    const wipErr = await enforceWipOnDoing(ctx, t2);
    if (wipErr) {
      await ctx.db.insert("activities", {
        type: "task_transition_denied",
        agent: args.actor,
        taskId: args.id,
        message: `Denied transition ${t2.state} -> DOING: ${wipErr}`,
        createdAt: now,
      });
      throw new Error(`TRANSITION_DENIED:${wipErr}`);
    }

    const res = validateTransition(t2.state, "DOING", t2 as any);
    if (!res.ok) {
      await ctx.db.insert("activities", {
        type: "task_transition_denied",
        agent: args.actor,
        taskId: args.id,
        message: `Denied transition ${t2.state} -> DOING: ${res.errors.join(",")}`,
        createdAt: now,
      });
      throw new Error(`TRANSITION_DENIED:${res.errors.join(",")}`);
    }

    await ctx.db.patch(args.id, { state: "DOING", updatedAt: now });
    await ctx.db.insert("activities", {
      type: "task_transition",
      agent: args.actor,
      taskId: args.id,
      message: `Transition ${t2.state} -> DOING`,
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
