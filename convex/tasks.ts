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

    await ctx.db.insert("activities", {
      type: "task_created",
      agent: args.owner,
      taskId: id,
      message: `Task created: ${args.title}`,
      createdAt: now,
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

const GATE_APPROVERS: Record<string, string> = {
  Security: "Sentinel",
  RevOps: "Ledger",
  Claims: "Fury",
  Product: "Shuri",
  None: "",
};

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

    const requiredApprover = GATE_APPROVERS[args.gate];
    if (args.gate !== "None" && args.actor !== requiredApprover) {
      await ctx.db.insert("activities", {
        type: "gate_approve_denied",
        agent: args.actor,
        taskId: args.id,
        message: `Denied gate approve ${args.gate}: actor_not_approver (expected ${requiredApprover})`,
        createdAt: now,
      });
      throw new Error("ACTOR_NOT_GATE_APPROVER");
    }

    if (t.executor && t.executor === args.actor) {
      await ctx.db.insert("activities", {
        type: "gate_approve_denied",
        agent: args.actor,
        taskId: args.id,
        message: `Denied gate approve ${args.gate}: approver_equals_executor`,
        createdAt: now,
      });
      throw new Error("APPROVER_EQUALS_EXECUTOR");
    }

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
    await ctx.db.insert("activities", {
      type: "gate_approved",
      agent: args.actor,
      taskId: args.id,
      message: `Gate approved: ${args.gate}`,
      createdAt: now,
    });

    return { ok: true };
  },
});
