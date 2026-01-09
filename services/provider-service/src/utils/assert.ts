export function assertTransition(from: string, action: string) {
  const allowed: Record<string, string[]> = {
    DRAFT: ["submit", "cancel"],
    SUBMITTED: ["approve", "reject", "cancel"],
    APPROVED: ["order", "cancel"],
    REJECTED: ["cancel"],
    ORDERED: ["receive", "cancel"],
    RECEIVED: [], // conversion only
    CANCELLED: [],
  };

  if (!allowed[from]?.includes(action)) {
    const err = new Error(`Invalid transition: ${from} -> ${action}`);
    (err as any).status = 400;
    throw err;
  }
}
