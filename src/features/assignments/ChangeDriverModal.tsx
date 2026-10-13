"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { fleetService } from "@/lib/services/fleetService";
import { Driver, VehicleDriverAssignment, DriverPosition } from "@/lib/types";
import { getTodayISODate, formatDate } from "@/lib/utils/dateUtils";

interface ChangeDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vehicleId: string;
  vehicleNumber: string;
  currentAssignment: VehicleDriverAssignment;
  currentDriver: Driver;
}

export function ChangeDriverModal({
  isOpen,
  onClose,
  onSuccess,
  vehicleId,
  vehicleNumber,
  currentAssignment,
  currentDriver,
}: ChangeDriverModalProps) {
  const [eligibleDrivers, setEligibleDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [endDate, setEndDate] = useState(getTodayISODate());
  const [endReason, setEndReason] = useState("Driver Transferred");
  const [endRemarks, setEndRemarks] = useState("");

  const [newDriverId, setNewDriverId] = useState("");
  const [startDate, setStartDate] = useState(getTodayISODate());
  const [startReason, setStartReason] = useState("Replacement Driver");

  const position: DriverPosition = currentAssignment.driverPosition || "Driver 1";

  useEffect(() => {
    if (isOpen) {
      loadDrivers();
      setEndDate(getTodayISODate());
      setStartDate(getTodayISODate());
      setEndReason("Driver Transferred");
      setEndRemarks("");
      setNewDriverId("");
      setError(null);
    }
  }, [isOpen]);

  const loadDrivers = async () => {
    try {
      const allDrivers = await fleetService.getAllDriversWithVehicleInfo();
      const activeAsgns = await fleetService.getActiveAssignmentsWithDetails();
      const assignedDriverIds = new Set(activeAsgns.map((a) => a.assignment.driverId));

      const eligible = allDrivers
        .filter(
          (d) =>
            d.driver.currentStatus === "Active" &&
            !assignedDriverIds.has(d.driver.id) &&
            d.driver.id !== currentDriver.id
        )
        .map((d) => d.driver);

      setEligibleDrivers(eligible);
    } catch (err: any) {
      setError(err.message || "Failed to load eligible replacement drivers.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriverId) {
      setError("Please select a new replacement driver.");
      return;
    }
    if (!endDate) {
      setError("Please specify the assignment completion date for the current driver.");
      return;
    }
    if (!startDate) {
      setError("Please specify the start date for the new driver.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await fleetService.changeDriver({
        vehicleId,
        oldAssignmentId: currentAssignment.id,
        newDriverId,
        driverPosition: position,
        endDate,
        endReason,
        startDate,
        startReason,
        remarks: endRemarks || undefined,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to change driver.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Change Driver (${position}) — ${vehicleNumber}`}
      description={`End active assignment for ${currentDriver.name} and assign replacement driver.`}
      maxWidth="md"
    >
      {error && (
        <div className="mb-3 border border-red-300 bg-red-50 p-2 text-xs text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 text-xs">
        {/* Step 1: Conclude Current Assignment */}
        <div className="border border-gray-300 bg-gray-50 p-3 space-y-2">
          <div className="font-bold text-gray-900 border-b border-gray-200 pb-1">
            Current Driver: {currentDriver.name} ({currentDriver.driverCode})
          </div>
          <div className="text-[11px] text-gray-500">
            Assigned Since: {formatDate(currentAssignment.assignedFrom)} • Position: {position}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                End Date *
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-gray-300 bg-white px-2 py-1 text-xs text-gray-900 focus:outline-none focus:border-blue-700"
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
                className="w-full border border-gray-300 bg-white px-2 py-1 text-xs text-gray-900 focus:outline-none focus:border-blue-700"
                required
              >
                <option value="Driver Transferred">Driver Transferred</option>
                <option value="Driver On Leave">Driver On Leave</option>
                <option value="Driver Suspended">Driver Suspended</option>
                <option value="Driver Resigned">Driver Resigned</option>
                <option value="Shift Rotation">Shift Rotation</option>
                <option value="Operational Requirement">Operational Requirement</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Handover Remarks
            </label>
            <input
              type="text"
              value={endRemarks}
              onChange={(e) => setEndRemarks(e.target.value)}
              placeholder="e.g. Handed over vehicle keys and logbook."
              className="w-full border border-gray-300 bg-white px-2 py-1 text-xs text-gray-900 focus:outline-none focus:border-blue-700"
            />
          </div>
        </div>

        {/* Step 2: New Replacement Driver */}
        <div className="border border-gray-300 bg-gray-50 p-3 space-y-2">
          <div className="font-bold text-gray-900 border-b border-gray-200 pb-1">
            Replacement Driver ({position})
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Select Replacement Driver *
            </label>
            <select
              value={newDriverId}
              onChange={(e) => setNewDriverId(e.target.value)}
              className="w-full border border-gray-300 bg-white px-2 py-1 text-xs text-gray-900 focus:outline-none focus:border-blue-700"
              required
            >
              <option value="">-- Select Active Driver --</option>
              {eligibleDrivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.driverCode}) — License: {d.licenseType || "HTV"}
                </option>
              ))}
            </select>
            {eligibleDrivers.length === 0 && (
              <p className="mt-1 text-[11px] text-amber-700">
                Notice: No unassigned active drivers available.
              </p>
            )}
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              New Start Date *
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-300 bg-white px-2 py-1 text-xs text-gray-900 focus:outline-none focus:border-blue-700"
              required
            />
          </div>
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
            disabled={loading || !newDriverId}
            className="border border-blue-700 bg-blue-700 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
          >
            {loading ? "Updating..." : `Replace ${position}`}
          </button>
        </div>
      </form>
    </Modal>
  );
}
