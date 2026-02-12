import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const setDod = mutation({
  args: {
    id: v.id("tasks"),
    actor: v.string(),
    items: v.array(
      v.object({
        label: v.string(),
        done: v.boolean(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const t = await ctx.db.get(args.id);
    if (!t) throw new Error("TASK_NOT_FOUND");

    // Minimal authorization: allow PMO or owner/executor to set DoD.
    const allowed = args.actor === "Jarvis" || args.actor === t.owner || args.actor === t.executor;
    await ctx.runMutation(internal.activity.log, {
      taskId: args.id,
      actor: args.actor,
      action: "DOD_SET_ATTEMPT",
      ok: true,
    });

    if (!allowed) {
      await ctx.runMutation(internal.activity.log, {
        taskId: args.id,
        actor: args.actor,
        action: "DOD_SET",
        ok: false,
        message: "FORBIDDEN_DOD_SET",
      });
      throw new Error("FORBIDDEN_DOD_SET");
    }

    await ctx.db.patch(args.id, { dodChecklist: args.items, updatedAt: now });

    await ctx.runMutation(internal.activity.log, {
      taskId: args.id,
      actor: args.actor,
      action: "DOD_SET",
      ok: true,
      meta: { count: args.items.length },
    });

    return { ok: true };
  },
});
