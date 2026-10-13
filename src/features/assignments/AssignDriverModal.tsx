"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { fleetService } from "@/lib/services/fleetService";
import { Vehicle, Driver, DriverPosition } from "@/lib/types";
import { getTodayISODate } from "@/lib/utils/dateUtils";

interface AssignDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preselectedVehicleId?: string;
  preselectedDriverId?: string;
  preselectedPosition?: DriverPosition;
}

export function AssignDriverModal({
  isOpen,
  onClose,
  onSuccess,
  preselectedVehicleId,
  preselectedDriverId,
  preselectedPosition,
}: AssignDriverModalProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicleDriverSlots, setVehicleDriverSlots] = useState<Map<string, { driver1: boolean; driver2: boolean }>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedVehicleId, setSelectedVehicleId] = useState(preselectedVehicleId || "");
  const [selectedDriverId, setSelectedDriverId] = useState(preselectedDriverId || "");
  const [driverPosition, setDriverPosition] = useState<DriverPosition>(preselectedPosition || "Driver 1");
  const [assignedFrom, setAssignedFrom] = useState(getTodayISODate());
  const [startReason, setStartReason] = useState("Operational Assignment");
  const [remarks, setRemarks] = useState("");

  const [step, setStep] = useState<"form" | "confirm">("form");

  useEffect(() => {
    if (isOpen) {
      loadData();
      setSelectedVehicleId(preselectedVehicleId || "");
      setSelectedDriverId(preselectedDriverId || "");
      setDriverPosition(preselectedPosition || "Driver 1");
      setAssignedFrom(getTodayISODate());
      setStep("form");
      setError(null);
    }
  }, [isOpen, preselectedVehicleId, preselectedDriverId, preselectedPosition]);

  const loadData = async () => {
    try {
      const allVehiclesWithDrivers = await fleetService.getAllVehiclesWithDriverInfo();
      const allDrivers = await fleetService.getAllDriversWithVehicleInfo();
      const activeAsgns = await fleetService.getActiveAssignmentsWithDetails();

      const slotsMap = new Map<string, { driver1: boolean; driver2: boolean }>();
      for (const item of allVehiclesWithDrivers) {
        slotsMap.set(item.vehicle.id, {
          driver1: !!item.driver1,
          driver2: !!item.driver2,
        });
      }
      setVehicleDriverSlots(slotsMap);

      const availableVehicles = allVehiclesWithDrivers
        .filter((item) => !item.driver1 || !item.driver2 || item.vehicle.id === preselectedVehicleId)
        .map((item) => item.vehicle);

      const assignedDriverIds = new Set(activeAsgns.map((a) => a.assignment.driverId));

      const eligibleDrivers = allDrivers
        .filter(
          (item) =>
            item.driver.currentStatus === "Active" &&
            (!assignedDriverIds.has(item.driver.id) || item.driver.id === preselectedDriverId)
        )
        .map((item) => item.driver);

      setVehicles(availableVehicles);
      setDrivers(eligibleDrivers);

      if (preselectedVehicleId && !preselectedPosition) {
        const slots = slotsMap.get(preselectedVehicleId);
        if (slots?.driver1 && !slots.driver2) {
          setDriverPosition("Driver 2");
        } else {
          setDriverPosition("Driver 1");
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to load assignment options");
    }
  };

  const handleVehicleChange = (vId: string) => {
    setSelectedVehicleId(vId);
    const slots = vehicleDriverSlots.get(vId);
    if (slots?.driver1 && !slots.driver2) {
      setDriverPosition("Driver 2");
    } else if (!slots?.driver1) {
      setDriverPosition("Driver 1");
    }
  };

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);
  const selectedDriver = drivers.find((d) => d.id === selectedDriverId);

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicleId) {
      setError("Please select a vehicle.");
      return;
    }
    if (!selectedDriverId) {
      setError("Please select an eligible driver.");
      return;
    }
    if (!assignedFrom) {
      setError("Please specify the assignment start date.");
      return;
    }

    const slots = vehicleDriverSlots.get(selectedVehicleId);
    if (driverPosition === "Driver 1" && slots?.driver1 && selectedVehicleId !== preselectedVehicleId) {
      setError("Driver 1 is already assigned on this vehicle. Please select Driver 2 or choose another vehicle.");
      return;
    }
    if (driverPosition === "Driver 2" && slots?.driver2 && selectedVehicleId !== preselectedVehicleId) {
      setError("Driver 2 is already assigned on this vehicle. Please select Driver 1 or choose another vehicle.");
      return;
    }

    setError(null);
    setStep("confirm");
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      await fleetService.assignDriver({
        vehicleId: selectedVehicleId,
        driverId: selectedDriverId,
        driverPosition,
        assignedFrom,
        startReason,
        remarks: remarks || undefined,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create assignment");
      setStep("form");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={step === "form" ? "Assign Driver to Vehicle" : "Review Assignment"}
      description={
        step === "form"
          ? "Allocate an active driver to a vehicle as Driver 1 or Driver 2."
          : "Verify operational details before confirming assignment."
      }
      maxWidth="md"
    >
      {error && (
        <div className="mb-3 border border-red-300 bg-red-50 p-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {step === "form" ? (
        <form onSubmit={handleReview} className="space-y-3 text-xs">
          {/* Vehicle Select */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Vehicle *
            </label>
            <select
              value={selectedVehicleId}
              onChange={(e) => handleVehicleChange(e.target.value)}
              disabled={!!preselectedVehicleId}
              className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-900 disabled:bg-gray-100 focus:outline-none focus:border-blue-700"
              required
            >
              <option value="">-- Select Vehicle --</option>
              {vehicles.map((v) => {
                const slots = vehicleDriverSlots.get(v.id);
                let availability = "Both positions vacant";
                if (slots?.driver1 && slots?.driver2) availability = "Fully Manned";
                else if (slots?.driver1) availability = "Driver 2 vacant";
                else if (slots?.driver2) availability = "Driver 1 vacant";

                return (
                  <option key={v.id} value={v.id}>
                    {v.vehicleNumber} — {v.make} {v.model} ({availability})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Driver Position Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Driver Position *
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDriverPosition("Driver 1")}
                  className={`flex-1 py-1.5 px-2 text-xs font-semibold border ${
                    driverPosition === "Driver 1"
                      ? "bg-blue-700 text-white border-blue-700"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  Driver 1
                </button>
                <button
                  type="button"
                  onClick={() => setDriverPosition("Driver 2")}
                  className={`flex-1 py-1.5 px-2 text-xs font-semibold border ${
                    driverPosition === "Driver 2"
                      ? "bg-blue-700 text-white border-blue-700"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  Driver 2
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Effective Date *
              </label>
              <input
                type="date"
                value={assignedFrom}
                onChange={(e) => setAssignedFrom(e.target.value)}
                className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-blue-700"
                required
              />
            </div>
          </div>

          {/* Driver Select */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Driver *
            </label>
            <select
              value={selectedDriverId}
              onChange={(e) => setSelectedDriverId(e.target.value)}
              disabled={!!preselectedDriverId}
              className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-900 disabled:bg-gray-100 focus:outline-none focus:border-blue-700"
              required
            >
              <option value="">-- Select Active Driver --</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.driverCode}) — License: {d.licenseType || "HTV"}
                </option>
              ))}
            </select>
            {drivers.length === 0 && (
              <p className="mt-1 text-[11px] text-amber-700">
                Notice: All active drivers are currently assigned.
              </p>
            )}
          </div>

          {/* Start Reason */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Assignment Reason
            </label>
            <input
              type="text"
              value={startReason}
              onChange={(e) => setStartReason(e.target.value)}
              placeholder="e.g. Regular Allocation, Shift Rotation"
              className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-blue-700"
            />
          </div>

          {/* Remarks */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Remarks
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={2}
              placeholder="Optional operational remarks"
              className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-blue-700"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="border border-blue-700 bg-blue-700 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-800"
            >
              Review
            </button>
          </div>
        </form>
      ) : (
        /* Confirmation step */
        <div className="space-y-3 text-xs">
          <div className="border border-gray-300 bg-gray-50 p-3 space-y-2">
            <div className="font-bold text-gray-900 border-b border-gray-200 pb-1">
              Assignment Confirmation Summary
            </div>
            <table className="w-full text-xs">
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-1 text-gray-500 w-28">Vehicle</td>
                  <td className="py-1 font-bold text-gray-900">
                    {selectedVehicle?.vehicleNumber} ({selectedVehicle?.make} {selectedVehicle?.model})
                  </td>
                </tr>
                <tr>
                  <td className="py-1 text-gray-500">Position</td>
                  <td className="py-1 font-bold text-gray-900">
                    {driverPosition}
                  </td>
                </tr>
                <tr>
                  <td className="py-1 text-gray-500">Driver</td>
                  <td className="py-1 font-bold text-gray-900">
                    {selectedDriver?.name} ({selectedDriver?.driverCode})
                  </td>
                </tr>
                <tr>
                  <td className="py-1 text-gray-500">Effective Date</td>
                  <td className="py-1 text-gray-900">{assignedFrom}</td>
                </tr>
                {startReason && (
                  <tr>
                    <td className="py-1 text-gray-500">Reason</td>
                    <td className="py-1 text-gray-700">{startReason}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setStep("form")}
              disabled={loading}
              className="border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="border border-blue-700 bg-blue-700 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-800"
            >
              {loading ? "Saving..." : `Confirm Assignment (${driverPosition})`}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
