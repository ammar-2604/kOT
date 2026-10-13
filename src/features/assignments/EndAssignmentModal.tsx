"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { fleetService } from "@/lib/services/fleetService";
import { DriverPosition } from "@/lib/types";
import { getTodayISODate } from "@/lib/utils/dateUtils";

interface EndAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  assignmentId: string;
  vehicleNumber?: string;
  driverName?: string;
  driverPosition?: DriverPosition;
}

export function EndAssignmentModal({
  isOpen,
  onClose,
  onSuccess,
  assignmentId,
  vehicleNumber,
  driverName,
  driverPosition,
}: EndAssignmentModalProps) {
  const [assignedTo, setAssignedTo] = useState(getTodayISODate());
  const [endReason, setEndReason] = useState("Operational Requirement");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setAssignedTo(getTodayISODate());
      setEndReason("Operational Requirement");
      setRemarks("");
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignedTo) {
      setError("Please specify the assignment completion date.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await fleetService.endAssignment(assignmentId, {
        assignedTo,
        endReason,
        remarks: remarks || undefined,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to end assignment.");
    } finally {
      setLoading(false);
    }
  };

  const posLabel = driverPosition ? ` (${driverPosition})` : "";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`End Vehicle Assignment${posLabel}`}
      description={`Conclude active assignment for ${driverName || "driver"} on ${vehicleNumber || "vehicle"}.`}
      maxWidth="md"
    >
      {error && (
        <div className="mb-3 border border-red-300 bg-red-50 p-2 text-xs text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 text-xs">
        <div className="border border-gray-300 bg-gray-50 p-2.5 text-gray-700 leading-normal">
          Ending this assignment will unassign <strong>{driverName || "driver"}</strong> from <strong>{vehicleNumber}</strong> as <strong>{driverPosition || "assigned driver"}</strong>. The position will become vacant for new assignment.
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">
            End Date *
          </label>
          <input
            type="date"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-blue-700"
            required
          />
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">
            End Reason *
          </label>
          <select
            value={endReason}
            onChange={(e) => setEndReason(e.target.value)}
            className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-blue-700"
            required
          >
            <option value="Driver Transferred">Driver Transferred</option>
            <option value="Driver On Leave">Driver On Leave</option>
            <option value="Driver Suspended">Driver Suspended</option>
            <option value="Driver Resigned">Driver Resigned</option>
            <option value="Shift Rotation">Shift Rotation</option>
            <option value="Operational Requirement">Operational Requirement</option>
            <option value="Vehicle Maintenance">Vehicle Maintenance</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">
            Remarks
          </label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={2}
            placeholder="e.g. Handover verified and keys received."
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
            className="border border-red-700 bg-red-700 px-4 py-1.5 text-xs font-semibold text-white hover:bg-red-800"
          >
            {loading ? "Ending..." : `End Assignment`}
          </button>
        </div>
      </form>
    </Modal>
  );
}
