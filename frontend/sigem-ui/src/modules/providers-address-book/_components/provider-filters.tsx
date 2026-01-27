import React from "react";
import {
  ProviderFilters as Filters,
  ProviderStatus,
  ProviderCategory,
} from "../types";
import { Search, Filter, X } from "lucide-react";

interface ProviderFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Partial<Filters>) => void;
  i18n: {
    search: string;
    filters: string;
    status: string;
    category: string;
    city: string;
  };
}

export function ProviderFilters({
  filters,
  onFiltersChange,
  i18n,
}: ProviderFiltersProps) {
  const [showFilters, setShowFilters] = React.useState(false);

  const hasActiveFilters = filters.status || filters.category || filters.city;

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={i18n.search}
            value={filters.search || ""}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2 border rounded-lg flex items-center gap-2 transition-colors ${
            hasActiveFilters
              ? "border-blue-500 bg-blue-50 text-blue-700"
              : "border-gray-300 hover:bg-gray-50"
          }`}
        >
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">{i18n.filters}</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {i18n.status}
              </label>
              <select
                value={filters.status || ""}
                onChange={(e) =>
                  onFiltersChange({
                    status: e.target.value as ProviderStatus | undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">All</option>
                <option value="ACTIVE">Active</option>
                <option value="DISABLED">Disabled</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {i18n.category}
              </label>
              <select
                value={filters.category || ""}
                onChange={(e) =>
                  onFiltersChange({
                    category: e.target.value as ProviderCategory | undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">All</option>
                <option value="SUPPLIER">Supplier</option>
                <option value="CONTRACTOR">Contractor</option>
                <option value="CONSULTANT">Consultant</option>
                <option value="SERVICE_PROVIDER">Service Provider</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            {/* City Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {i18n.city}
              </label>
              <input
                type="text"
                value={filters.city || ""}
                onChange={(e) => onFiltersChange({ city: e.target.value })}
                placeholder="Enter city..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="flex justify-end">
              <button
                onClick={() =>
                  onFiltersChange({
                    status: undefined,
                    category: undefined,
                    city: undefined,
                  })
                }
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Clear filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
