import React from "react";
import { cn } from "@/lib/utils/cn";
import { LucideIcon } from "lucide-react";

export interface TabItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  badge?: number | string;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn("border-b border-gray-300 bg-white", className)}>
      <nav className="-mb-px flex space-x-1" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={cn(
                "py-2 px-3.5 text-xs font-medium border-b-2 transition-none cursor-pointer whitespace-nowrap",
                isActive
                  ? "border-blue-700 text-blue-900 font-bold bg-slate-50"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge !== null && (
                <span
                  className={cn(
                    "ml-1.5 text-[11px] font-mono",
                    isActive ? "text-blue-900 font-bold" : "text-gray-500"
                  )}
                >
                  ({tab.badge})
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
