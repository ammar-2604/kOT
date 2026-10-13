import React from "react";
import { cn } from "@/lib/utils/cn";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: LucideIcon;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  href?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  href,
}: StatCardProps) {
  const content = (
    <div className="bg-white border border-gray-300 p-3">
      <div className="text-xs font-semibold text-gray-600">
        {title}
      </div>
      <div className="text-2xl font-bold text-gray-900 mt-0.5">
        {value}
      </div>
      {subtitle && (
        <div className="text-[11px] text-gray-500 mt-0.5">
          {subtitle}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block no-underline hover:opacity-90">
        {content}
      </a>
    );
  }

  return content;
}
