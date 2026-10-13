import React from "react";
import { cn } from "@/lib/utils/cn";

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  icon?: any;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "p-6 text-center border border-gray-200 bg-gray-50/50 text-gray-600",
        className
      )}
    >
      <div className="text-xs font-semibold text-gray-800">{title}</div>
      {description && <div className="mt-0.5 text-xs text-gray-500">{description}</div>}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-2.5 px-3 py-1 text-xs font-medium bg-white border border-gray-300 text-gray-800 hover:bg-gray-100 cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
