import { useState } from "react";
import { ProviderDataSource } from "./adapters/types";
import { Provider, Permissions, I18nLabels, DEFAULT_I18N } from "./types";
import { exportToCSV } from "./utils/csv";
import { Plus, Download, Upload, Loader2, AlertCircle } from "lucide-react";
import { useProviders } from "./hooks/use-providers";
import { useToast } from "./hooks/use-toast";
import { ProviderFilters } from "./_components/provider-filters";
import { ProvidersTable } from "./_components/provider-table";
import { EmptyState } from "./_components/empty-state";
import { ProviderDetailsDrawer } from "./_components/provider-details-drawer";
import { ProviderFormModal } from "./_components/provider-form-modal";

export interface ProviderAddressBookModuleProps {
  dataSource: ProviderDataSource;
  permissions?: Permissions;
  i18n?: Partial<I18nLabels>;
  onSelectProvider?: (provider: Provider) => void;
  onImportCSV?: () => void;
  pageSize?: number;
}

export function ProviderAddressBookModule({
  dataSource,
  permissions = {},
  i18n: customI18n = {},
  onSelectProvider,
  onImportCSV,
  pageSize = 10,
}: ProviderAddressBookModuleProps) {
  const i18n = { ...DEFAULT_I18N, ...customI18n };

  const {
    providers,
    total,
    loading,
    error,
    filters,
    sort,
    pagination,
    updateFilters,
    updateSort,
    goToPage,
    refresh,
  } = useProviders({ dataSource, pageSize });

  const { toasts, showToast, removeToast } = useToast();

  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
    null,
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    provider: Provider;
    action: "disable" | "enable" | "delete";
  } | null>(null);

  const handleProviderClick = (provider: Provider) => {
    setSelectedProvider(provider);
    setIsDetailsOpen(true);
    onSelectProvider?.(provider);
  };

  const handleEdit = (provider: Provider) => {
    setEditingProvider(provider);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingProvider(null);
    setIsFormOpen(true);
  };

  const handleSave = async (data: Partial<Provider>) => {
    try {
      if (editingProvider) {
        await dataSource.update(editingProvider.id, data);
        showToast("Provider updated successfully", "success");
      } else {
        await dataSource.create(data as any);
        showToast("Provider created successfully", "success");
      }
      refresh();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Operation failed",
        "error",
      );
      throw err;
    }
  };

  const handleToggleStatus = (provider: Provider) => {
    setConfirmAction({
      provider,
      action: provider.status === "ACTIVE" ? "disable" : "enable",
    });
  };

  const handleDelete = (provider: Provider) => {
    setConfirmAction({ provider, action: "delete" });
  };

  const executeAction = async () => {
    if (!confirmAction) return;

    try {
      const { provider, action } = confirmAction;

      if (action === "disable") {
        await dataSource.disable(provider.id);
        showToast("Provider disabled", "success");
      } else if (action === "enable") {
        await dataSource.enable(provider.id);
        showToast("Provider enabled", "success");
      } else if (action === "delete" && dataSource.delete) {
        await dataSource.delete(provider.id);
        showToast("Provider deleted", "success");
      }

      setConfirmAction(null);
      setIsDetailsOpen(false);
      refresh();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Operation failed",
        "error",
      );
    }
  };

  const handleExport = async () => {
    try {
      const allData = await dataSource.list(filters, sort, {
        page: 1,
        pageSize: 10000,
      });
      exportToCSV(allData.data);
      showToast("Export successful", "success");
    } catch (err) {
      showToast("Export failed", "error");
    }
  };

  const totalPages = Math.ceil(total / pagination.pageSize);

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in ${
              toast.type === "success"
                ? "bg-green-600 text-white"
                : toast.type === "error"
                  ? "bg-red-600 text-white"
                  : "bg-blue-600 text-white"
            }`}
          >
            <span>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="hover:opacity-80"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{i18n.title}</h1>

          <div className="flex items-center gap-2">
            {permissions.canExport !== false && (
              <button
                onClick={handleExport}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">{i18n.exportCSV}</span>
              </button>
            )}

            {permissions.canImport !== false && onImportCSV && (
              <button
                onClick={onImportCSV}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">{i18n.importCSV}</span>
              </button>
            )}

            {permissions.canCreate !== false && (
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">{i18n.addProvider}</span>
              </button>
            )}
          </div>
        </div>

        <ProviderFilters
          filters={filters}
          onFiltersChange={updateFilters}
          i18n={i18n}
        />
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="ml-3 text-gray-600">{i18n.loading}</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-16 text-red-600">
            <AlertCircle className="w-6 h-6 mr-2" />
            <span>{error}</span>
          </div>
        ) : providers.length === 0 ? (
          <EmptyState message={i18n.noResults} />
        ) : (
          <>
            <ProvidersTable
              providers={providers}
              sort={sort}
              onSortChange={updateSort}
              onProviderClick={handleProviderClick}
              onEdit={permissions.canEdit !== false ? handleEdit : undefined}
              onToggleStatus={
                permissions.canDisable !== false
                  ? handleToggleStatus
                  : undefined
              }
              onDelete={dataSource.delete ? handleDelete : undefined}
              permissions={permissions}
              i18n={i18n}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Showing {(pagination.page - 1) * pagination.pageSize + 1} to{" "}
                  {Math.min(pagination.page * pagination.pageSize, total)} of{" "}
                  {total} providers
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => goToPage(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`px-3 py-1 rounded ${
                          pagination.page === page
                            ? "bg-blue-600 text-white"
                            : "border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  {totalPages > 5 && <span className="text-gray-400">...</span>}

                  <button
                    onClick={() => goToPage(pagination.page + 1)}
                    disabled={pagination.page === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Details Drawer */}
      <ProviderDetailsDrawer
        provider={selectedProvider}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />

      {/* Form Modal */}
      <ProviderFormModal
        provider={editingProvider}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
        i18n={i18n}
      />

      {/* Confirmation Dialog */}
      {confirmAction && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setConfirmAction(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Confirm {confirmAction.action}
              </h3>
              <p className="text-gray-600 mb-6">
                {confirmAction.action === "disable" && i18n.confirmDisable}
                {confirmAction.action === "enable" && i18n.confirmEnable}
                {confirmAction.action === "delete" &&
                  `Are you sure you want to delete "${confirmAction.provider.name}"? This action cannot be undone.`}
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setConfirmAction(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {i18n.cancel}
                </button>
                <button
                  onClick={executeAction}
                  className={`px-4 py-2 rounded-lg text-white ${
                    confirmAction.action === "delete"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
