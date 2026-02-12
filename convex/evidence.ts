import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const add = mutation({
  args: {
    id: v.id("tasks"),
    actor: v.string(),
    link: v.string(),
    sha: v.optional(v.string()),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const t = await ctx.db.get(args.id);
    if (!t) throw new Error("TASK_NOT_FOUND");

    const payload = {
      link: args.link,
      sha: args.sha,
      note: args.note,
    };

    await ctx.runMutation(internal.activity.log, {
      taskId: args.id,
      actor: args.actor,
      action: "EVIDENCE_ADDED",
      ok: true,
      message: `evidence:${JSON.stringify(payload)}`,
      meta: payload,
    });

    return { ok: true };
  },
});
