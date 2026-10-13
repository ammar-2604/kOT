import React from "react";
import { cn } from "@/lib/utils/cn";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function StatusBadge({ status, size = "md", className }: StatusBadgeProps) {
  const lower = (status || "").toLowerCase();

  let dotColor = "bg-gray-400";
  let textColor = "text-gray-700";

  if (lower === "active" || lower === "valid") {
    dotColor = "bg-emerald-600";
    textColor = "text-emerald-800";
  } else if (lower === "on leave" || lower === "expiring soon" || lower === "under maintenance") {
    dotColor = "bg-amber-600";
    textColor = "text-amber-800";
  } else if (lower === "suspended" || lower === "expired" || lower === "terminated") {
    dotColor = "bg-red-600";
    textColor = "text-red-800";
  } else if (lower === "completed") {
    dotColor = "bg-gray-500";
    textColor = "text-gray-700";
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap",
        textColor,
        className
      )}
    >
      <span className={cn("h-2 w-2 rounded-full shrink-0", dotColor)} />
      <span>{status}</span>
    </span>
  );
}
