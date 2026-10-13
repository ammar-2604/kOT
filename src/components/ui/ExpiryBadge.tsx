import React from "react";
import { getExpiryStatus } from "@/lib/utils/expiry";
import { cn } from "@/lib/utils/cn";

interface ExpiryBadgeProps {
  expiryDate?: string | null;
  className?: string;
}

export function ExpiryBadge({ expiryDate, className }: ExpiryBadgeProps) {
  const { status, label } = getExpiryStatus(expiryDate);

  if (status === "Expired") {
    return (
      <span className={cn("text-xs font-semibold text-red-700 whitespace-nowrap", className)}>
        Expired ({label})
      </span>
    );
  }

  if (status === "Expiring Soon") {
    return (
      <span className={cn("text-xs font-medium text-amber-800 whitespace-nowrap", className)}>
        Expiring ({label})
      </span>
    );
  }

  if (status === "Valid") {
    return (
      <span className={cn("text-xs text-gray-700 whitespace-nowrap", className)}>
        Valid ({label})
      </span>
    );
  }

  return (
    <span className={cn("text-xs text-gray-400 whitespace-nowrap", className)}>
      —
    </span>
  );
}
