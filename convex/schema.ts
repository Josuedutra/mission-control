import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const TaskType = v.union(
  v.literal("EPIC"),
  v.literal("FEATURE"),
  v.literal("BUG"),
  v.literal("SECURITY"),
  v.literal("REVOPS"),
  v.literal("OPS"),
  v.literal("RESEARCH"),
  v.literal("CONTENT"),
  v.literal("DOC"),
  v.literal("INCIDENT"),
);

const Priority = v.union(v.literal("P0"), v.literal("P1"), v.literal("P2"), v.literal("P3"));

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

const Board = v.union(
  v.literal("Inbox"),
  v.literal("Company"),
  v.literal("Ritmo"),
  v.literal("Factory"),
  v.literal("Portfolio"),
);

const EvidenceRequired = v.boolean();

const SlaClass = v.union(v.literal("none"), v.literal("standard"), v.literal("urgent"), v.literal("incident"));

export default defineSchema({
  agents: defineTable({
    name: v.string(),
    role: v.string(),
    status: v.union(v.literal("idle"), v.literal("active"), v.literal("blocked")),
    sessionKey: v.optional(v.string()),
    currentTaskId: v.optional(v.id("tasks")),
    lastSeenAt: v.optional(v.number()),
  }).index("by_name", ["name"]),

  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),

    board: Board,
    product: v.string(),
    domain: v.string(),

    type: TaskType,
    priority: Priority,
    state: State,

    owner: v.string(),
    executor: v.string(),

    gate: Gate,
    evidenceRequired: EvidenceRequired,

    slaClass: SlaClass,
    riskScore: v.number(), // 1–5

    auditLink: v.optional(v.string()),
    links: v.optional(v.array(v.string())),

    dodChecklist: v.array(v.object({
      label: v.string(),
      done: v.boolean(),
    })),

    docsUpdated: v.optional(v.boolean()),

    approvals: v.array(
      v.object({
        gate: Gate,
        approvedBy: v.string(),
        timestampUtc: v.number(),
        evidenceLink: v.optional(v.string()),
        notes: v.optional(v.string()),
      }),
    ),

    override: v.optional(
      v.object({
        used: v.boolean(),
        by: v.string(),
        reason: v.string(),
        acceptedRisk: v.string(),
        reviewDeadlineUtc: v.number(),
        followupTaskId: v.optional(v.id("tasks")),
      }),
    ),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_state", ["state"])
    .index("by_board", ["board", "state"])
    .index("by_owner", ["owner", "state"]),

  posts: defineTable({
    taskId: v.id("tasks"),
    from: v.string(),
    content: v.string(),
    createdAt: v.number(),
  }).index("by_task", ["taskId", "createdAt"]),

  activities: defineTable({
    type: v.string(),
    agent: v.optional(v.string()),
    taskId: v.optional(v.id("tasks")),
    message: v.string(),
    createdAt: v.number(),
  }).index("by_createdAt", ["createdAt"]),

  documents: defineTable({
    title: v.string(),
    content: v.string(),
    docType: v.string(),
    taskId: v.optional(v.id("tasks")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_task", ["taskId", "createdAt"]),

  notifications: defineTable({
    mentioned: v.string(),
    content: v.string(),
    delivered: v.boolean(),
    readAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_mentioned", ["mentioned", "delivered"]),
});
