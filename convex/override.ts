import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const overrideGate = mutation({
  args: {
    id: v.id("tasks"),
    actor: v.string(),
    reason: v.string(),
    acceptedRisk: v.string(),
    reviewDeadlineUtc: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const t = await ctx.db.get(args.id);
    if (!t) throw new Error("TASK_NOT_FOUND");

    if (args.actor !== "Founder") {
      await ctx.db.insert("activities", {
        type: "override_denied",
        agent: args.actor,
        taskId: args.id,
        message: "Denied override: actor_not_founder",
        createdAt: now,
      });
      throw new Error("ACTOR_NOT_FOUNDER");
    }

    // Create follow-up P0 task (default owner Sentinel)
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
        reviewDeadlineUtc: args.reviewDeadlineUtc,
        followupTaskId: followupId,
      },
      updatedAt: now,
    });

    await ctx.db.insert("activities", {
      type: "override_used",
      agent: args.actor,
      taskId: args.id,
      message: `Override used. Follow-up task: ${followupId}`,
      createdAt: now,
    });

    return { ok: true, followupTaskId: followupId };
  },
});
