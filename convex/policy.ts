import type { GateType, TaskState } from "./constants";

type DodItem = { label: string; done: boolean };

type Approval = {
  gate: GateType;
  approvedBy: string;
  timestampUtc: number;
  evidenceLink?: string;
  notes?: string;
};

type TaskLike = {
  type: string;
  board: string;
  product: string;
  domain: string;
  priority: string;
  owner: string;
  gate: GateType;
  evidenceRequired: boolean;
  auditLink?: string;
  docsUpdated?: boolean;
  dodChecklist: DodItem[];
  approvals: Approval[];
  override?: {
    used: boolean;
    by: string;
    reason: string;
    acceptedRisk: string;
    reviewDeadlineIso: string;
    reviewDeadlineUtc?: number;
  };
};

export type TransitionResult = { ok: true } | { ok: false; errors: string[] };

export function validateTransition(
  from: TaskState,
  to: TaskState,
  task: TaskLike,
): TransitionResult {
  const errors: string[] = [];

  // Base mandatory fields always (fail-closed)
  for (const [k, v] of Object.entries({
    board: task.board,
    product: task.product,
    domain: task.domain,
    type: task.type,
    priority: task.priority,
    owner: task.owner,
  })) {
    if (!v || (typeof v === "string" && v.trim().length === 0)) errors.push(`MISSING_${k.toUpperCase()}`);
  }

  // INBOX -> TRIAGED: require Type/Product/Priority/Owner
  if (from === "INBOX" && to === "TRIAGED") {
    // already covered by base fields
  }

  // Enter DOING: DoD checklist present + evidenceRequired explicit
  if (to === "DOING") {
    if (!Array.isArray(task.dodChecklist) || task.dodChecklist.length === 0) errors.push("MISSING_DOD_CHECKLIST");
    if (typeof task.evidenceRequired !== "boolean") errors.push("MISSING_EVIDENCE_REQUIRED");
  }

  // Leave REVIEW or enter DONE: evidence link(s) required if evidenceRequired
  if ((from === "REVIEW" && to !== "REVIEW") || to === "DONE") {
    if (task.evidenceRequired) {
      const hasAnyLink = !!task.auditLink || (task.approvals ?? []).some((a) => !!a.evidenceLink);
      if (!hasAnyLink) errors.push("MISSING_EVIDENCE_LINK");
    }
  }

  // DONE requires: DoD all done + docsUpdated for key types + gate approval
  if (to === "DONE") {
    if (task.dodChecklist?.some((i) => !i.done)) errors.push("DOD_INCOMPLETE");

    const needsDocs = ["SECURITY", "REVOPS", "INCIDENT", "FEATURE"].includes(task.type);
    if (needsDocs && task.docsUpdated !== true) errors.push("DOCS_NOT_UPDATED");

    if (task.gate !== "None") {
      const approved = (task.approvals ?? []).some((a) => a.gate === task.gate);
      const overridden = task.override?.used === true;
      if (!approved && !overridden) errors.push("GATE_NOT_APPROVED");
    }

    // Override must be explicit if used
    if (task.override?.used) {
      if (!task.override.by) errors.push("OVERRIDE_MISSING_BY");
      if (!task.override.reason) errors.push("OVERRIDE_MISSING_REASON");
      if (!task.override.acceptedRisk) errors.push("OVERRIDE_MISSING_ACCEPTED_RISK");
      if (!task.override.reviewDeadlineIso) errors.push("OVERRIDE_MISSING_REVIEW_DEADLINE");
    }
  }

  return errors.length ? { ok: false, errors } : { ok: true };
}
