import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const setDocsUpdated = mutation({
  args: {
    id: v.id("tasks"),
    actor: v.string(),
    docsUpdated: v.boolean(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const t = await ctx.db.get(args.id);
    if (!t) throw new Error("TASK_NOT_FOUND");

    // Prevent changes on DONE tasks (fail-closed).
    if (t.state === "DONE") {
      await ctx.runMutation(internal.activity.log, {
        taskId: args.id,
        actor: args.actor,
        action: "DOCS_UPDATED_SET",
        ok: false,
        message: "CONFLICT_TASK_ALREADY_DONE",
        meta: { from: t.docsUpdated ?? null, to: args.docsUpdated },
      });
      throw new Error("CONFLICT_TASK_ALREADY_DONE");
    }

    const allowed = args.actor === "Jarvis" || args.actor === t.owner || args.actor === t.executor;

    await ctx.runMutation(internal.activity.log, {
      taskId: args.id,
      actor: args.actor,
      action: "DOCS_UPDATED_SET_ATTEMPT",
      ok: true,
      meta: { from: t.docsUpdated ?? null, to: args.docsUpdated },
    });

    if (!allowed) {
      await ctx.runMutation(internal.activity.log, {
        taskId: args.id,
        actor: args.actor,
        action: "DOCS_UPDATED_SET",
        ok: false,
        message: "FORBIDDEN_DOCS_UPDATED_SET",
        meta: { from: t.docsUpdated ?? null, to: args.docsUpdated },
      });
      throw new Error("FORBIDDEN_DOCS_UPDATED_SET");
    }

    await ctx.db.patch(args.id, { docsUpdated: args.docsUpdated, updatedAt: now });

    await ctx.runMutation(internal.activity.log, {
      taskId: args.id,
      actor: args.actor,
      action: "DOCS_UPDATED_SET",
      ok: true,
      meta: { from: t.docsUpdated ?? null, to: args.docsUpdated },
    });

    return { ok: true };
  },
});
