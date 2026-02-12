export const TaskTypes = [
  "EPIC",
  "FEATURE",
  "BUG",
  "SECURITY",
  "REVOPS",
  "OPS",
  "RESEARCH",
  "CONTENT",
  "DOC",
  "INCIDENT",
] as const;
export type TaskType = (typeof TaskTypes)[number];

export const TaskPriorities = ["P0", "P1", "P2", "P3"] as const;
export type TaskPriority = (typeof TaskPriorities)[number];

export const TaskStates = [
  "INBOX",
  "TRIAGED",
  "READY",
  "DOING",
  "REVIEW",
  "APPROVAL",
  "DONE",
  "BLOCKED",
] as const;
export type TaskState = (typeof TaskStates)[number];

export const GateTypes = ["None", "Security", "RevOps", "Claims", "Product"] as const;
export type GateType = (typeof GateTypes)[number];

export const BoardTypes = ["Inbox", "Company", "Ritmo", "Factory", "Portfolio"] as const;
export type BoardType = (typeof BoardTypes)[number];

export const SlaClasses = ["none", "standard", "urgent", "incident"] as const;
export type SlaClass = (typeof SlaClasses)[number];

export const AgentStatuses = ["idle", "active", "blocked"] as const;
export type AgentStatus = (typeof AgentStatuses)[number];
