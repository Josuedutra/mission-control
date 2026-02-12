import { query } from "./_generated/server";
import { v } from "convex/values";

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

const Board = v.union(
  v.literal("Inbox"),
  v.literal("Company"),
  v.literal("Ritmo"),
  v.literal("Factory"),
  v.literal("Portfolio"),
);

const Gate = v.union(
  v.literal("None"),
  v.literal("Security"),
  v.literal("RevOps"),
  v.literal("Claims"),
  v.literal("Product"),
);

export const listByBoard = query({
  args: { board: Board, state: v.optional(State) },
  handler: async (ctx, args) => {
    if (args.state) {
      return await ctx.db
        .query("tasks")
        .withIndex("by_board", (q) => q.eq("board", args.board).eq("state", args.state!))
        .collect();
    }

    // Collect per state using the board+state index.
    const states = [
      "INBOX",
      "TRIAGED",
      "READY",
      "DOING",
      "REVIEW",
      "APPROVAL",
      "DONE",
      "BLOCKED",
    ] as const;

    const batches = await Promise.all(
      states.map((s) =>
        ctx.db.query("tasks").withIndex("by_board", (q) => q.eq("board", args.board).eq("state", s)).collect(),
      ),
    );

    return batches.flat();
  },
});

export const listByOwner = query({
  args: { owner: v.string(), state: v.optional(State) },
  handler: async (ctx, args) => {
    if (args.state) {
      return await ctx.db
        .query("tasks")
        .withIndex("by_owner", (q) => q.eq("owner", args.owner).eq("state", args.state!))
        .collect();
    }
    // naive: collect all states for owner
    const states = ["INBOX", "TRIAGED", "READY", "DOING", "REVIEW", "APPROVAL", "DONE", "BLOCKED"] as const;
    const batches = await Promise.all(
      states.map((s) => ctx.db.query("tasks").withIndex("by_owner", (q) => q.eq("owner", args.owner).eq("state", s)).collect()),
    );
    return batches.flat();
  },
});

export const countByState = query({
  args: { state: State },
  handler: async (ctx, args) => {
    const tasks = await ctx.db.query("tasks").withIndex("by_state", (q) => q.eq("state", args.state)).collect();
    return { ok: true, count: tasks.length, ids: tasks.map((t: any) => t._id) };
  },
});

export const listByStateMinimal = query({
  args: { state: State },
  handler: async (ctx, args) => {
    const tasks = await ctx.db.query("tasks").withIndex("by_state", (q) => q.eq("state", args.state)).collect();
    const items = (tasks as any[]).map((t) => ({
      id: t._id,
      title: t.title,
      board: t.board,
      executor: t.executor,
      owner: t.owner,
    }));
    return { ok: true, items };
  },
});

export const listBlocked = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tasks").withIndex("by_state", (q) => q.eq("state", "BLOCKED")).collect();
  },
});

export const listApprovalPending = query({
  args: { gate: v.optional(Gate) },
  handler: async (ctx, args) => {
    const candidates = await ctx.db.query("tasks").collect();
    return candidates.filter((t: any) => {
      if (!t.gate || t.gate === "None") return false;
      if (args.gate && t.gate !== args.gate) return false;
      const approved = (t.approvals ?? []).some((a: any) => a.gate === t.gate);
      const overridden = t.override?.used === true;
      return !approved && !overridden;
    });
  },
});
