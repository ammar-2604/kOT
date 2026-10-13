"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { fleetService } from "@/lib/services/fleetService";
import { VehicleDriverAssignment, Vehicle, Driver, DriverPosition } from "@/lib/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate, calculateDuration } from "@/lib/utils/dateUtils";
import { EmptyState } from "@/components/ui/EmptyState";
import { AssignDriverModal } from "@/features/assignments/AssignDriverModal";
import { ChangeDriverModal } from "@/features/assignments/ChangeDriverModal";
import { EndAssignmentModal } from "@/features/assignments/EndAssignmentModal";

export default function AssignmentsPage() {
  const [allAssignments, setAllAssignments] = useState<VehicleDriverAssignment[]>([]);
  const [vehiclesMap, setVehiclesMap] = useState<Map<string, Vehicle>>(new Map());
  const [driversMap, setDriversMap] = useState<Map<string, Driver>>(new Map());
  const [loading, setLoading] = useState(true);

  // Tabs: "active" | "history"
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [positionFilter, setPositionFilter] = useState<string>("ALL");

  // Modals
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [changeDriverData, setChangeDriverData] = useState<{
    assignment: VehicleDriverAssignment;
    vehicle: Vehicle;
    driver: Driver;
  } | null>(null);
  const [endAssignmentData, setEndAssignmentData] = useState<{
    assignment: VehicleDriverAssignment;
    vehicle: Vehicle;
    driver: Driver;
  } | null>(null);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const [vehicles, drivers] = await Promise.all([
        fleetService.getAllVehiclesWithDriverInfo(),
        fleetService.getAllDriversWithVehicleInfo(),
      ]);

      const { assignmentRepository } = await import("@/lib/repositories");
      const fullList = await assignmentRepository.getAll();
      setAllAssignments(fullList);

      const vMap = new Map(vehicles.map((v) => [v.vehicle.id, v.vehicle]));
      const dMap = new Map(drivers.map((d) => [d.driver.id, d.driver]));
      setVehiclesMap(vMap);
      setDriversMap(dMap);
    } catch (err) {
      console.error("Failed to load assignments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
    const handleReset = () => loadAssignments();
    window.addEventListener("kot_data_reset", handleReset);
    return () => window.removeEventListener("kot_data_reset", handleReset);
  }, []);

  const activeAssignmentsList = useMemo(() => {
    return allAssignments.filter((a) => a.status === "Active");
  }, [allAssignments]);

  const historyAssignmentsList = useMemo(() => {
    return allAssignments.filter((a) => a.status === "Completed");
  }, [allAssignments]);

  const displayedAssignments = useMemo(() => {
    const list = activeTab === "active" ? activeAssignmentsList : historyAssignmentsList;
    return list.filter((a) => {
      // Position filter
      if (positionFilter !== "ALL" && a.driverPosition !== positionFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const veh = vehiclesMap.get(a.vehicleId);
        const drv = driversMap.get(a.driverId);
        const matchVeh = (veh?.vehicleNumber || "").toLowerCase().includes(q);
        const matchDrv = (drv?.name || "").toLowerCase().includes(q);
        const matchCode = (drv?.driverCode || "").toLowerCase().includes(q);
        const matchReason = (a.startReason || a.endReason || "").toLowerCase().includes(q);
        if (!matchVeh && !matchDrv && !matchCode && !matchReason) {
          return false;
        }
      }

      return true;
    });
  }, [activeTab, activeAssignmentsList, historyAssignmentsList, searchQuery, positionFilter, vehiclesMap, driversMap]);

  return (
    <div className="space-y-3">
      {/* Page Title & Tab Bar */}
      <div className="flex items-center justify-between border-b border-gray-300 pb-2">
        <div className="flex items-center gap-4">
          <h1 className="text-base font-bold text-gray-900">Assignments</h1>
          <div className="inline-flex border border-gray-300 bg-white">
            <button
              type="button"
              onClick={() => setActiveTab("active")}
              className={`px-3 py-1 text-xs font-medium cursor-pointer ${
                activeTab === "active"
                  ? "bg-slate-800 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Active ({activeAssignmentsList.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("history")}
              className={`px-3 py-1 text-xs font-medium cursor-pointer border-l border-gray-300 ${
                activeTab === "history"
                  ? "bg-slate-800 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              History ({historyAssignmentsList.length})
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setAssignModalOpen(true)}
          className="bg-blue-700 hover:bg-blue-800 text-white px-3 py-1 text-xs font-medium border border-blue-800 cursor-pointer"
        >
          + Assign Driver
        </button>
      </div>

      {/* Toolbar: Search & Filter */}
      <div className="flex flex-wrap items-center gap-3 bg-white border border-gray-300 p-2">
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-gray-600">Search:</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Vehicle, driver, code..."
            className="border border-gray-300 px-2 py-0.5 text-xs text-gray-800 w-48 focus:border-blue-700"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <label className="text-xs text-gray-600">Position:</label>
          <select
            value={positionFilter}
            onChange={(e) => setPositionFilter(e.target.value)}
            className="border border-gray-300 bg-white px-2 py-0.5 text-xs text-gray-800 focus:border-blue-700"
          >
            <option value="ALL">All Positions</option>
            <option value="Driver 1">Driver 1</option>
            <option value="Driver 2">Driver 2</option>
          </select>
        </div>

        {(searchQuery || positionFilter !== "ALL") && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setPositionFilter("ALL");
            }}
            className="text-xs text-blue-700 hover:underline cursor-pointer ml-auto"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Data Table */}
      <div className="border border-gray-300 bg-white overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead className="bg-gray-100 border-b border-gray-300 text-gray-700 font-semibold">
            <tr>
              <th className="py-2 px-3 border-r border-gray-200">Vehicle</th>
              <th className="py-2 px-3 border-r border-gray-200">Driver</th>
              <th className="py-2 px-3 border-r border-gray-200">Position</th>
              <th className="py-2 px-3 border-r border-gray-200">Assigned From</th>
              {activeTab === "history" && (
                <>
                  <th className="py-2 px-3 border-r border-gray-200">Assigned To</th>
                  <th className="py-2 px-3 border-r border-gray-200">Duration</th>
                  <th className="py-2 px-3 border-r border-gray-200">End Reason</th>
                </>
              )}
              {activeTab === "active" && (
                <th className="py-2 px-3 border-r border-gray-200">Duration</th>
              )}
              <th className="py-2 px-3 border-r border-gray-200">Status</th>
              <th className="py-2 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-gray-800">
            {displayedAssignments.map((asgn) => {
              const vehicle = vehiclesMap.get(asgn.vehicleId);
              const driver = driversMap.get(asgn.driverId);
              return (
                <tr key={asgn.id} className="hover:bg-gray-50">
                  <td className="py-2 px-3 border-r border-gray-200 font-semibold">
                    {vehicle ? (
                      <Link
                        href={`/vehicles/${vehicle.id}`}
                        className="text-blue-700 hover:underline"
                      >
                        {vehicle.vehicleNumber}
                      </Link>
                    ) : (
                      "Archived Vehicle"
                    )}
                  </td>
                  <td className="py-2 px-3 border-r border-gray-200">
                    {driver ? (
                      <span>
                        <Link
                          href={`/drivers/${driver.id}`}
                          className="font-medium text-gray-900 hover:underline"
                        >
                          {driver.name}
                        </Link>
                        <span className="text-gray-500 font-mono text-[11px] ml-1.5">
                          ({driver.driverCode})
                        </span>
                      </span>
                    ) : (
                      "Archived Driver"
                    )}
                  </td>
                  <td className="py-2 px-3 border-r border-gray-200 font-medium text-gray-700">
                    {asgn.driverPosition}
                  </td>
                  <td className="py-2 px-3 border-r border-gray-200 text-gray-700 whitespace-nowrap">
                    {formatDate(asgn.assignedFrom)}
                  </td>
                  {activeTab === "history" && (
                    <>
                      <td className="py-2 px-3 border-r border-gray-200 text-gray-700 whitespace-nowrap">
                        {formatDate(asgn.assignedTo)}
                      </td>
                      <td className="py-2 px-3 border-r border-gray-200 text-gray-700 whitespace-nowrap">
                        {calculateDuration(asgn.assignedFrom, asgn.assignedTo)}
                      </td>
                      <td className="py-2 px-3 border-r border-gray-200 text-gray-600">
                        {asgn.endReason || "—"}
                      </td>
                    </>
                  )}
                  {activeTab === "active" && (
                    <td className="py-2 px-3 border-r border-gray-200 text-gray-700 whitespace-nowrap">
                      {calculateDuration(asgn.assignedFrom)}
                    </td>
                  )}
                  <td className="py-2 px-3 border-r border-gray-200">
                    <StatusBadge status={asgn.status} />
                  </td>
                  <td className="py-2 px-3 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      {asgn.status === "Active" && vehicle && driver && (
                        <>
                          <button
                            type="button"
                            onClick={() => setChangeDriverData({ assignment: asgn, vehicle, driver })}
                            className="text-xs text-blue-700 hover:underline cursor-pointer"
                          >
                            Change
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            type="button"
                            onClick={() => setEndAssignmentData({ assignment: asgn, vehicle, driver })}
                            className="text-xs text-red-700 hover:underline cursor-pointer"
                          >
                            End
                          </button>
                          <span className="text-gray-300">|</span>
                        </>
                      )}
                      {vehicle && (
                        <Link
                          href={`/vehicles/${vehicle.id}`}
                          className="text-xs text-gray-600 hover:underline"
                        >
                          View
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {displayedAssignments.length === 0 && !loading && (
              <tr>
                <td colSpan={activeTab === "history" ? 8 : 6} className="py-6 text-center text-gray-500">
                  No assignments match the selected criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <AssignDriverModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        onSuccess={loadAssignments}
      />

      {changeDriverData && (
        <ChangeDriverModal
          isOpen={!!changeDriverData}
          onClose={() => setChangeDriverData(null)}
          onSuccess={loadAssignments}
          vehicleId={changeDriverData.vehicle.id}
          vehicleNumber={changeDriverData.vehicle.vehicleNumber}
          currentAssignment={changeDriverData.assignment}
          currentDriver={changeDriverData.driver}
        />
      )}

      {endAssignmentData && (
        <EndAssignmentModal
          isOpen={!!endAssignmentData}
          onClose={() => setEndAssignmentData(null)}
          onSuccess={loadAssignments}
          assignmentId={endAssignmentData.assignment.id}
          vehicleNumber={endAssignmentData.vehicle.vehicleNumber}
          driverName={endAssignmentData.driver.name}
          driverPosition={endAssignmentData.assignment.driverPosition}
        />
      )}
    </div>
  );
}
