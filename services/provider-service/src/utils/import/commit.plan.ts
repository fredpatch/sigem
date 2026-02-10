export type CommitMode = "create" | "update" | "skip";

export type CommitRow = {
  rowIndex: number;
  mode: CommitMode;
  targetId?: string; // required for update/skip
  data?: any; // required for create/update
};

export type CommitAction =
  | { mode: "create"; rowIndex: number; data: any; opIndex?: number }
  | {
      mode: "update";
      rowIndex: number;
      targetId: string;
      data: any;
      opIndex?: number;
    }
  | { mode: "skip"; rowIndex: number; targetId?: string };

export type CommitResult = {
  rowIndex: number;
  mode: CommitMode;
  ok: boolean;
  id?: string;
  error?: string;
  opIndex?: number; // only useful for create mapping
};

export type CommitPlan = {
  summary: { create: number; update: number; skip: number; errors: number };
  actions: CommitAction[];
  results: CommitResult[];
};
