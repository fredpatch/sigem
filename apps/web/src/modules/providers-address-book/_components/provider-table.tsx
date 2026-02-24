import { Provider, ProviderSort, Permissions, I18nLabels } from "../types";
import { ProviderActions } from "./provider-actions";
import { ChevronUp, ChevronDown, MapPin, Mail, Phone } from "lucide-react";

interface ProvidersTableProps {
  providers: Provider[];
  sort: ProviderSort;
  onSortChange: (sort: ProviderSort) => void;
  onProviderClick: (provider: Provider) => void;
  onEdit?: (provider: Provider) => void;
  onToggleStatus?: (provider: Provider) => void;
  onDelete?: (provider: Provider) => void;
  permissions: Permissions;
  i18n: Required<I18nLabels>;
}

export function ProvidersTable({
  providers,
  sort,
  onSortChange,
  onProviderClick,
  onEdit,
  onToggleStatus,
  onDelete,
  permissions,
  i18n,
}: ProvidersTableProps) {
  const handleSort = (field: keyof Provider) => {
    if (sort.field === field) {
      onSortChange({
        field,
        direction: sort.direction === "asc" ? "desc" : "asc",
      });
    } else {
      onSortChange({ field, direction: "asc" });
    }
  };

  const SortIcon = ({ field }: { field: keyof Provider }) => {
    if (sort.field !== field) return null;
    return sort.direction === "asc" ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center gap-1">
                  {i18n.name}
                  <SortIcon field="name" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("category")}
              >
                <div className="flex items-center gap-1">
                  {i18n.category}
                  <SortIcon field="category" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Contact
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Location
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center gap-1">
                  {i18n.status}
                  <SortIcon field="status" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                {i18n.tags}
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                {i18n.actions}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {providers.map((provider) => (
              <tr
                key={provider.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onProviderClick(provider)}
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">
                    {provider.name}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {provider.category.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-1 text-sm text-gray-600">
                    {provider.phones[0] && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {provider.phones[0]}
                      </div>
                    )}
                    {provider.emails[0] && (
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {provider.emails[0]}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin className="w-3 h-3" />
                    {provider.address.city}, {provider.address.country}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      provider.status === "ACTIVE"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {provider.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {provider.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {provider.tags.length > 2 && (
                      <span className="px-2 py-0.5 text-xs text-gray-500">
                        +{provider.tags.length - 2}
                      </span>
                    )}
                  </div>
                </td>
                <td
                  className="px-4 py-3 text-right"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ProviderActions
                    provider={provider}
                    permissions={permissions}
                    onEdit={onEdit}
                    onToggleStatus={onToggleStatus}
                    onDelete={onDelete}
                    i18n={i18n}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-3">
        {providers.map((provider) => (
          <div
            key={provider.id}
            onClick={() => onProviderClick(provider)}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {provider.name}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {provider.category.replace("_", " ")}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      provider.status === "ACTIVE"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {provider.status}
                  </span>
                </div>
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                <ProviderActions
                  provider={provider}
                  permissions={permissions}
                  onEdit={onEdit}
                  onToggleStatus={onToggleStatus}
                  onDelete={onDelete}
                  i18n={i18n}
                />
              </div>
            </div>

            <div className="space-y-2 text-sm">
              {provider.phones[0] && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  {provider.phones[0]}
                </div>
              )}
              {provider.emails[0] && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  {provider.emails[0]}
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                {provider.address.city}, {provider.address.country}
              </div>
            </div>

            {provider.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {provider.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
