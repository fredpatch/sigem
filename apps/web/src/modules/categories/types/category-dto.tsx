export type CategoryCreateInput = {
  label: string;
  family?: "EQUIPEMENT" | "INFORMATIQUE" | "MOBILIER";
  parentId?: string | null;
  description?: string;
};

export type CategoryUpdateInput = Partial<CategoryCreateInput> & {
  id: string;
};
