"use client";

import React, { useState } from "react";
import { RotateCcw } from "lucide-react";
import { storageManager } from "@/lib/repositories/storageManager";
import { ConfirmDialog } from "../ui/ConfirmDialog";

export function ResetDemoDataButton() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = () => {
    setIsResetting(true);
    storageManager.resetAllData();
    setTimeout(() => {
      setIsResetting(false);
      setShowConfirm(false);
      window.location.reload();
    }, 400);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className="inline-flex items-center gap-1.5 border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 cursor-pointer"
        title="Reset data back to initial seed state"
      >
        <RotateCcw className="h-3 w-3 text-gray-500" />
        <span>Reset Data</span>
      </button>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleReset}
        title="Reset Application Data"
        message="This will reset all vehicles, drivers, assignments, status histories, and documents back to their initial seed state."
        confirmText="Yes, Reset Data"
        variant="warning"
        isLoading={isResetting}
      />
    </>
  );
}
