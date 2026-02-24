export type PersistedTableState = {
  columnOrder?: string[];
  pageSize?: number;
  pageIndex?: number;
  // optionnel plus tard: columnVisibility, sorting, etc.
};

const KEY = (tableId: string) => `tbl:${tableId}`;

export function loadTableState(tableId?: string): PersistedTableState | null {
  if (!tableId) return null;
  try {
    const raw = localStorage.getItem(KEY(tableId));
    return raw ? (JSON.parse(raw) as PersistedTableState) : null;
  } catch {
    return null;
  }
}

export function saveTableState(tableId: string, next: PersistedTableState) {
  try {
    const prev = loadTableState(tableId) ?? {};
    localStorage.setItem(KEY(tableId), JSON.stringify({ ...prev, ...next }));
  } catch {
    // ignore
  }
}
