export type ProviderStatus = "ACTIVE" | "DISABLED";

export type ProviderCategory =
  | "SUPPLIER"
  | "CONTRACTOR"
  | "CONSULTANT"
  | "SERVICE_PROVIDER"
  | "OTHER";

export interface ContactPerson {
  id: string;
  fullName: string;
  role: string;
  phone: string;
  email: string;
}

export interface Address {
  country: string;
  city: string;
  street: string;
  zipCode?: string;
}

export interface Provider {
  id: string;
  name: string;
  category: ProviderCategory;
  phones: string[];
  emails: string[];
  address: Address;
  contacts: ContactPerson[];
  tags: string[];
  status: ProviderStatus;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  notes?: string;
}

export interface ProviderFilters {
  search?: string;
  status?: ProviderStatus;
  category?: ProviderCategory;
  city?: string;
  tags?: string[];
}

export interface ProviderSort {
  field: keyof Provider;
  direction: "asc" | "desc";
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface ListResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Permissions {
  canCreate?: boolean;
  canEdit?: boolean;
  canDisable?: boolean;
  canExport?: boolean;
  canImport?: boolean;
}

export interface I18nLabels {
  title?: string;
  search?: string;
  filters?: string;
  addProvider?: string;
  exportCSV?: string;
  importCSV?: string;
  name?: string;
  category?: string;
  status?: string;
  city?: string;
  tags?: string;
  actions?: string;
  edit?: string;
  disable?: string;
  enable?: string;
  delete?: string;
  save?: string;
  cancel?: string;
  loading?: string;
  noResults?: string;
  confirmDisable?: string;
  confirmEnable?: string;
}

export const DEFAULT_I18N: Required<I18nLabels> = {
  title: "Providers Address Book",
  search: "Search providers...",
  filters: "Filters",
  addProvider: "Add Provider",
  exportCSV: "Export CSV",
  importCSV: "Import CSV",
  name: "Name",
  category: "Category",
  status: "Status",
  city: "City",
  tags: "Tags",
  actions: "Actions",
  edit: "Edit",
  disable: "Disable",
  enable: "Enable",
  delete: "Delete",
  save: "Save",
  cancel: "Cancel",
  loading: "Loading...",
  noResults: "No providers found",
  confirmDisable: "Are you sure you want to disable this provider?",
  confirmEnable: "Are you sure you want to enable this provider?",
};
