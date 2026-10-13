"use client";

import React from "react";
import { Menu } from "lucide-react";
import { ResetDemoDataButton } from "../common/ResetDemoDataButton";

interface HeaderProps {
  onOpenMobileSidebar: () => void;
}

export function Header({ onOpenMobileSidebar }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-11 w-full items-center justify-between border-b border-gray-300 bg-white px-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="p-1 text-gray-600 hover:bg-gray-100 lg:hidden cursor-pointer"
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4" />
        </button>
        <span className="text-xs font-semibold text-gray-700">
          Karachi Oil Trading — Operations Portal
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden sm:inline text-xs text-gray-500">
          Operator: Keamari Depot
        </span>
        <ResetDemoDataButton />
      </div>
    </header>
  );
}
