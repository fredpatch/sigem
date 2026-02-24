import { useState } from "react";
import { Provider, Permissions } from "../types";
import { MoreVertical, Edit, Power, PowerOff, Trash2 } from "lucide-react";

interface ProviderActionsProps {
  provider: Provider;
  permissions: Permissions;
  onEdit?: (provider: Provider) => void;
  onToggleStatus?: (provider: Provider) => void;
  onDelete?: (provider: Provider) => void;
  i18n: {
    edit: string;
    disable: string;
    enable: string;
    delete: string;
  };
}

export function ProviderActions({
  provider,
  permissions,
  onEdit,
  onToggleStatus,
  onDelete,
  i18n,
}: ProviderActionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const canEdit = permissions.canEdit !== false;
  const canToggle = permissions.canDisable !== false;

  if (!canEdit && !canToggle) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 hover:bg-gray-100 rounded transition-colors"
      >
        <MoreVertical className="w-4 h-4 text-gray-600" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
            {canEdit && onEdit && (
              <button
                onClick={() => {
                  onEdit(provider);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
              >
                <Edit className="w-4 h-4" />
                {i18n.edit}
              </button>
            )}

            {canToggle && onToggleStatus && (
              <button
                onClick={() => {
                  onToggleStatus(provider);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
              >
                {provider.status === "ACTIVE" ? (
                  <>
                    <PowerOff className="w-4 h-4" />
                    {i18n.disable}
                  </>
                ) : (
                  <>
                    <Power className="w-4 h-4" />
                    {i18n.enable}
                  </>
                )}
              </button>
            )}

            {onDelete && (
              <button
                onClick={() => {
                  onDelete(provider);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
              >
                <Trash2 className="w-4 h-4" />
                {i18n.delete}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
