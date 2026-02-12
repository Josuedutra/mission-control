export type GateType = "Security" | "RevOps" | "Claims" | "Product";

export const GATE_APPROVER: Record<GateType, string> = {
  Security: "Sentinel",
  RevOps: "Ledger",
  Claims: "Fury",
  Product: "Shuri",
};

export function requireApprover(gate: GateType, actor: string) {
  const expected = GATE_APPROVER[gate];
  if (actor !== expected) {
    throw new Error(
      `FORBIDDEN: actor '${actor}' cannot approve '${gate}'. Expected '${expected}'.`,
    );
  }
}

export function requireApproverNotExecutor(actor: string, executor?: string) {
  if (executor && actor === executor) {
    throw new Error(`FORBIDDEN: approver '${actor}' cannot be the executor of the task.`);
  }
}
