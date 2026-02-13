import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const setExecutor = mutation({
  args: {
    id: v.id("tasks"),
    actor: v.string(),
    executor: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const t = await ctx.db.get(args.id);
    if (!t) throw new Error("TASK_NOT_FOUND");

    // Fail-closed: prevent changes on DONE tasks.
    if (t.state === "DONE") {
      await ctx.runMutation(internal.activity.log, {
        taskId: args.id,
        actor: args.actor,
        action: "EXECUTOR_SET",
        ok: false,
        message: "CONFLICT_TASK_ALREADY_DONE",
        meta: { from: t.executor, to: args.executor },
      });
      throw new Error("CONFLICT_TASK_ALREADY_DONE");
    }

    const allowed = args.actor === "Jarvis" || args.actor === t.owner;

    await ctx.runMutation(internal.activity.log, {
      taskId: args.id,
      actor: args.actor,
      action: "EXECUTOR_SET_ATTEMPT",
      ok: true,
      meta: { from: t.executor, to: args.executor },
    });

    if (!allowed) {
      await ctx.runMutation(internal.activity.log, {
        taskId: args.id,
        actor: args.actor,
        action: "EXECUTOR_SET",
        ok: false,
        message: "FORBIDDEN_EXECUTOR_SET",
        meta: { from: t.executor, to: args.executor },
      });
      throw new Error("FORBIDDEN_EXECUTOR_SET");
    }

    await ctx.db.patch(args.id, { executor: args.executor, updatedAt: now });

    await ctx.runMutation(internal.activity.log, {
      taskId: args.id,
      actor: args.actor,
      action: "EXECUTOR_SET",
      ok: true,
      meta: { from: t.executor, to: args.executor },
    });

    return { ok: true };
  },
});
