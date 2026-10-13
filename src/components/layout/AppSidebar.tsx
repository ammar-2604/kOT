"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Truck,
  Users,
  ClipboardList,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Vehicles", href: "/vehicles", icon: Truck },
    { name: "Drivers", href: "/drivers", icon: Users },
    { name: "Assignments", href: "/assignments", icon: ClipboardList },
    { name: "Compliance", href: "/dashboard#expiring-documents", icon: ShieldCheck },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-60 flex-col bg-slate-800 text-slate-200 border-r border-slate-700 lg:z-30 lg:translate-x-0 transition-transform duration-200",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* App Title */}
        <div className="h-12 shrink-0 px-4 flex items-center border-b border-slate-700 bg-slate-900">
          <div>
            <div className="text-xs font-bold text-white tracking-wide">Karachi Oil Trading</div>
            <div className="text-[11px] text-slate-400">Fleet Operations</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-none",
                  isActive
                    ? "bg-blue-800 text-white font-semibold"
                    : "text-slate-300 hover:bg-slate-700/60 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4 shrink-0 text-slate-400" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="shrink-0 p-2.5 border-t border-slate-700 bg-slate-900 text-center text-[11px] text-slate-400">
          Karachi Fleet HQ
        </div>
      </aside>
    </>
  );
}
