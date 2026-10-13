"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { fleetService } from "@/lib/services/fleetService";
import { Driver, DriverStatus, VehicleDriverAssignment } from "@/lib/types";
import { getTodayISODate } from "@/lib/utils/dateUtils";

interface ChangeStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  driver: Driver;
  currentAssignment?: VehicleDriverAssignment | null;
  assignedVehicleNumber?: string;
}

export function ChangeStatusModal({
  isOpen,
  onClose,
  onSuccess,
  driver,
  currentAssignment,
  assignedVehicleNumber,
}: ChangeStatusModalProps) {
  const [newStatus, setNewStatus] = useState<DriverStatus>("On Leave");
  const [effectiveFrom, setEffectiveFrom] = useState(getTodayISODate());
  const [effectiveTo, setEffectiveTo] = useState("");
  const [reason, setReason] = useState("");
  const [remarks, setRemarks] = useState("");
  const [endActiveAssignment, setEndActiveAssignment] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (driver.currentStatus === "Active") {
        setNewStatus("On Leave");
      } else {
        setNewStatus("Active");
      }
      setEffectiveFrom(getTodayISODate());
      setEffectiveTo("");
      setReason("");
      setRemarks("");
      setEndActiveAssignment(true);
      setError(null);
    }
  }, [isOpen, driver.currentStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveFrom) {
      setError("Please specify the effective date.");
      return;
    }
    if (!reason.trim()) {
      setError("Please specify a reason for this status change.");
      return;
    }

    if (newStatus === "On Leave" && !effectiveTo) {
      setError("Please specify the expected return date for leave.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await fleetService.changeDriverStatus({
        driverId: driver.id,
        newStatus,
        effectiveFrom,
        effectiveTo: effectiveTo || undefined,
        reason: reason.trim(),
        remarks: remarks.trim() || undefined,
        endActiveAssignment: !!currentAssignment && endActiveAssignment,
        createdBy: "Fleet Operations Management",
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update driver status.");
    } finally {
      setLoading(false);
    }
  };

  const isAssigned = !!currentAssignment;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Update Driver Status — ${driver.name}`}
      description={`Current status: ${driver.currentStatus}. Status changes are permanently recorded in the audit history.`}
      maxWidth="md"
    >
      {error && (
        <div className="mb-3 border border-red-300 bg-red-50 p-2 text-xs text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 text-xs">
        <div>
          <label className="block font-semibold text-gray-700 mb-1">
            New Status *
          </label>
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as DriverStatus)}
            className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-blue-700"
            required
          >
            <option value="Active">Active (Eligible for assignment)</option>
            <option value="On Leave">On Leave (Temporary absence)</option>
            <option value="Suspended">Suspended (Safety / disciplinary)</option>
            <option value="Resigned">Resigned (Voluntary departure)</option>
            <option value="Terminated">Terminated (Separated)</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {isAssigned && newStatus !== "Active" && (
          <div className="border border-amber-300 bg-amber-50 p-2.5 text-gray-800 space-y-1.5">
            <div className="font-semibold text-amber-900">
              Active Vehicle Assignment Detected: {assignedVehicleNumber || "Vehicle"}
            </div>
            <p className="text-[11px] text-gray-700">
              This driver is currently assigned. Changing status to {newStatus} should conclude their active assignment.
            </p>
            <label className="flex items-center gap-2 pt-1 font-medium text-gray-900 cursor-pointer">
              <input
                type="checkbox"
                checked={endActiveAssignment}
                onChange={(e) => setEndActiveAssignment(e.target.checked)}
                className="h-3.5 w-3.5 border-gray-300 text-blue-700"
              />
              <span>Conclude active assignment on {assignedVehicleNumber}</span>
            </label>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Effective From *
            </label>
            <input
              type="date"
              value={effectiveFrom}
              onChange={(e) => setEffectiveFrom(e.target.value)}
              className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-blue-700"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              {newStatus === "On Leave" ? "Expected Return Date *" : "Effective To (Optional)"}
            </label>
            <input
              type="date"
              value={effectiveTo}
              onChange={(e) => setEffectiveTo(e.target.value)}
              required={newStatus === "On Leave"}
              className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-blue-700"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">
            Reason *
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Annual Leave, Disciplinary Review, Personal Resignation"
            className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-blue-700"
            required
          />
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">
            Administrative Remarks
          </label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={2}
            placeholder="Optional operational notes or committee remarks"
            className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-blue-700"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="border border-blue-700 bg-blue-700 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-800"
          >
            {loading ? "Updating..." : `Apply Status`}
          </button>
        </div>
      </form>
    </Modal>
  );
}
