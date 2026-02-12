import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const log = internalMutation({
  args: {
    taskId: v.optional(v.id("tasks")),
    actor: v.string(),
    action: v.string(),
    ok: v.boolean(),
    message: v.optional(v.string()),
    meta: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("activities", {
      type: args.action,
      agent: args.actor,
      taskId: args.taskId,
      message: args.message ?? args.action,
      createdAt: Date.now(),
      // keep raw meta in message for now? store in message only; schema doesn't have meta
    });
  },
});
