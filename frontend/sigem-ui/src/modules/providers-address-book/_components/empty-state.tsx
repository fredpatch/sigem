import { FileX } from "lucide-react";

interface EmptyStateProps {
  message?: string;
  description?: string;
}

export function EmptyState({
  message = "No providers found",
  description = "Try adjusting your filters or add a new provider",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <FileX className="w-16 h-16 text-gray-300 mb-4" />
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{message}</h3>
      <p className="text-sm text-gray-500 text-center max-w-md">
        {description}
      </p>
    </div>
  );
}
