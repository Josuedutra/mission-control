import { mutation } from "./_generated/server";
import { v } from "convex/values";

import { internal } from "./_generated/api";

export const overrideGate = mutation({
  args: {
    id: v.id("tasks"),
    actor: v.string(),
    reason: v.string(),
    acceptedRisk: v.string(),
    reviewDeadlineIso: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const t = await ctx.db.get(args.id);
    if (!t) throw new Error("TASK_NOT_FOUND");

    await ctx.runMutation(internal.activity.log, {
      taskId: args.id,
      actor: args.actor,
      action: "OVERRIDE_ATTEMPT",
      ok: true,
    });

    try {
      if (args.actor !== "Founder") throw new Error("FORBIDDEN_ONLY_FOUNDER");

      const followupId = await ctx.db.insert("tasks", {
        title: `[P0][FOLLOWUP] Override follow-up for: ${t.title}`,
        description: `Reason: ${args.reason}\nAcceptedRisk: ${args.acceptedRisk}`,
        board: t.board,
        product: t.product,
        domain: t.domain,
        type: "SECURITY",
        priority: "P0",
        state: "INBOX",
        owner: "Sentinel",
        executor: "Sentinel",
        gate: "Security",
        evidenceRequired: true,
        slaClass: "urgent",
        riskScore: 5,
        dodChecklist: [],
        approvals: [],
        createdAt: now,
        updatedAt: now,
      });

      await ctx.db.patch(args.id, {
        override: {
          used: true,
          by: args.actor,
          reason: args.reason,
          acceptedRisk: args.acceptedRisk,
          reviewDeadlineIso: args.reviewDeadlineIso,
          followupTaskId: followupId,
        },
        updatedAt: now,
      });

      await ctx.runMutation(internal.activity.log, {
        taskId: args.id,
        actor: args.actor,
        action: "OVERRIDE_USED",
        ok: true,
        meta: { followupTaskId: followupId },
      });

      return { ok: true, followupTaskId: followupId };
    } catch (e: any) {
      await ctx.runMutation(internal.activity.log, {
        taskId: args.id,
        actor: args.actor,
        action: "OVERRIDE_USED",
        ok: false,
        message: e?.message ?? String(e),
      });
      throw e;
    }
  },
});
