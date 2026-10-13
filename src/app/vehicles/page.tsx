"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { fleetService, VehicleWithDriversSummary } from "@/lib/services/fleetService";
import { Vehicle, Driver, VehicleDriverAssignment, DriverPosition } from "@/lib/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatCapacityKL } from "@/lib/utils/formatters";
import { AssignDriverModal } from "@/features/assignments/AssignDriverModal";
import { ChangeDriverModal } from "@/features/assignments/ChangeDriverModal";
import { EndAssignmentModal } from "@/features/assignments/EndAssignmentModal";

export default function VehiclesPage() {
  const [vehiclesData, setVehiclesData] = useState<VehicleWithDriversSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [crewFilter, setCrewFilter] = useState<string>("ALL");

  // Modals
  const [assignModalConfig, setAssignModalConfig] = useState<{
    vehicleId: string;
    position?: DriverPosition;
  } | null>(null);

  const [changeDriverData, setChangeDriverData] = useState<{
    vehicle: Vehicle;
    driver: Driver;
    assignment: VehicleDriverAssignment;
  } | null>(null);

  const [endAssignmentData, setEndAssignmentData] = useState<{
    assignmentId: string;
    vehicleNumber: string;
    driverName: string;
    driverPosition: DriverPosition;
  } | null>(null);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const data = await fleetService.getAllVehiclesWithDriverInfo();
      setVehiclesData(data);
    } catch (err) {
      console.error("Failed to load vehicles:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
    const handleReset = () => loadVehicles();
    window.addEventListener("kot_data_reset", handleReset);
    return () => window.removeEventListener("kot_data_reset", handleReset);
  }, []);

  const filteredVehicles = useMemo(() => {
    return vehiclesData.filter(({ vehicle, driver1, driver2 }) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNumber = vehicle.vehicleNumber.toLowerCase().includes(q);
        const matchMake = (vehicle.make || "").toLowerCase().includes(q);
        const matchModel = (vehicle.model || "").toLowerCase().includes(q);
        const matchChassis = (vehicle.chassisNumber || "").toLowerCase().includes(q);
        const matchEngine = (vehicle.engineNumber || "").toLowerCase().includes(q);
        const matchD1 = (driver1?.name || "").toLowerCase().includes(q);
        const matchD2 = (driver2?.name || "").toLowerCase().includes(q);
        if (!matchNumber && !matchMake && !matchModel && !matchChassis && !matchEngine && !matchD1 && !matchD2) {
          return false;
        }
      }

      if (statusFilter !== "ALL" && vehicle.status !== statusFilter) {
        return false;
      }

      if (typeFilter !== "ALL" && vehicle.vehicleType !== typeFilter) {
        return false;
      }

      if (crewFilter === "FULLY_MANNED" && (!driver1 || !driver2)) return false;
      if (crewFilter === "PARTIALLY_MANNED" && ((!driver1 && !driver2) || (driver1 && driver2))) return false;
      if (crewFilter === "UNASSIGNED" && (driver1 || driver2)) return false;

      return true;
    });
  }, [vehiclesData, searchQuery, statusFilter, typeFilter, crewFilter]);

  return (
    <div className="space-y-3">
      {/* Title & Top Action */}
      <div className="flex items-center justify-between border-b border-gray-300 pb-2">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-bold text-gray-900">Vehicles</h1>
          <span className="text-xs text-gray-500">
            ({vehiclesData.length} total)
          </span>
        </div>

        <Link
          href="/vehicles/new"
          className="bg-blue-700 hover:bg-blue-800 text-white px-3 py-1 text-xs font-medium border border-blue-800"
        >
          + Add Vehicle
        </Link>
      </div>

      {/* Toolbar: Search & Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-white border border-gray-300 p-2">
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-gray-600">Search:</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Vehicle number, make, driver..."
            className="border border-gray-300 px-2 py-0.5 text-xs text-gray-800 w-52 focus:border-blue-700"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <label className="text-xs text-gray-600">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 bg-white px-2 py-0.5 text-xs text-gray-800 focus:border-blue-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Under Maintenance">Under Maintenance</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <label className="text-xs text-gray-600">Type:</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-gray-300 bg-white px-2 py-0.5 text-xs text-gray-800 focus:border-blue-700"
          >
            <option value="ALL">All Types</option>
            <option value="Oil Tanker">Oil Tanker</option>
            <option value="Bowser">Bowser</option>
            <option value="Prime Mover">Prime Mover</option>
            <option value="Rigid Tanker">Rigid Tanker</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <label className="text-xs text-gray-600">Crew:</label>
          <select
            value={crewFilter}
            onChange={(e) => setCrewFilter(e.target.value)}
            className="border border-gray-300 bg-white px-2 py-0.5 text-xs text-gray-800 focus:border-blue-700"
          >
            <option value="ALL">All Crew Statuses</option>
            <option value="FULLY_MANNED">Fully Manned (2 Drivers)</option>
            <option value="PARTIALLY_MANNED">Partial (1 Driver)</option>
            <option value="UNASSIGNED">Unassigned (0 Drivers)</option>
          </select>
        </div>

        {(searchQuery || statusFilter !== "ALL" || typeFilter !== "ALL" || crewFilter !== "ALL") && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("ALL");
              setTypeFilter("ALL");
              setCrewFilter("ALL");
            }}
            className="text-xs text-blue-700 hover:underline cursor-pointer ml-auto"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Flat Data Table */}
      <div className="border border-gray-300 bg-white overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead className="bg-gray-100 border-b border-gray-300 text-gray-700 font-semibold">
            <tr>
              <th className="py-2 px-3 border-r border-gray-200">Vehicle #</th>
              <th className="py-2 px-3 border-r border-gray-200">Make / Model</th>
              <th className="py-2 px-3 border-r border-gray-200">Type</th>
              <th className="py-2 px-3 border-r border-gray-200">Capacity</th>
              <th className="py-2 px-3 border-r border-gray-200">Status</th>
              <th className="py-2 px-3 border-r border-gray-200">Driver 1</th>
              <th className="py-2 px-3 border-r border-gray-200">Driver 2</th>
              <th className="py-2 px-3 border-r border-gray-200">Chambers</th>
              <th className="py-2 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-gray-800">
            {filteredVehicles.map(({ vehicle, driver1, driver2, driver1Assignment, driver2Assignment }) => (
              <tr key={vehicle.id} className="hover:bg-gray-50">
                {/* Vehicle # */}
                <td className="py-2 px-3 border-r border-gray-200 font-bold">
                  <Link
                    href={`/vehicles/${vehicle.id}`}
                    className="text-blue-700 hover:underline"
                  >
                    {vehicle.vehicleNumber}
                  </Link>
                </td>

                {/* Make / Model */}
                <td className="py-2 px-3 border-r border-gray-200 text-gray-700">
                  {vehicle.make} {vehicle.model}
                  {vehicle.manufacturingYear && (
                    <span className="text-gray-400 text-[11px] ml-1">({vehicle.manufacturingYear})</span>
                  )}
                </td>

                {/* Type */}
                <td className="py-2 px-3 border-r border-gray-200 text-gray-700">
                  {vehicle.vehicleType}
                </td>

                {/* Capacity */}
                <td className="py-2 px-3 border-r border-gray-200 text-gray-900 font-medium">
                  {formatCapacityKL(vehicle.capacityKL)}
                </td>

                {/* Status */}
                <td className="py-2 px-3 border-r border-gray-200">
                  <StatusBadge status={vehicle.status} />
                </td>

                {/* Driver 1 */}
                <td className="py-2 px-3 border-r border-gray-200 whitespace-nowrap">
                  {driver1 && driver1Assignment ? (
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/drivers/${driver1.id}`}
                        className="font-medium text-gray-900 hover:underline"
                      >
                        {driver1.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() =>
                          setChangeDriverData({
                            vehicle,
                            driver: driver1,
                            assignment: driver1Assignment,
                          })
                        }
                        className="text-[11px] text-blue-700 hover:underline cursor-pointer"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <span>Unassigned</span>
                      <button
                        type="button"
                        onClick={() =>
                          setAssignModalConfig({
                            vehicleId: vehicle.id,
                            position: "Driver 1",
                          })
                        }
                        className="text-[11px] text-blue-700 hover:underline font-medium cursor-pointer"
                      >
                        Assign
                      </button>
                    </div>
                  )}
                </td>

                {/* Driver 2 */}
                <td className="py-2 px-3 border-r border-gray-200 whitespace-nowrap">
                  {driver2 && driver2Assignment ? (
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/drivers/${driver2.id}`}
                        className="font-medium text-gray-900 hover:underline"
                      >
                        {driver2.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() =>
                          setChangeDriverData({
                            vehicle,
                            driver: driver2,
                            assignment: driver2Assignment,
                          })
                        }
                        className="text-[11px] text-blue-700 hover:underline cursor-pointer"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <span>Unassigned</span>
                      <button
                        type="button"
                        onClick={() =>
                          setAssignModalConfig({
                            vehicleId: vehicle.id,
                            position: "Driver 2",
                          })
                        }
                        className="text-[11px] text-blue-700 hover:underline font-medium cursor-pointer"
                      >
                        Assign
                      </button>
                    </div>
                  )}
                </td>

                {/* Chambers */}
                <td className="py-2 px-3 border-r border-gray-200 text-gray-600">
                  {vehicle.compartments?.length || 0} Chambers
                </td>

                {/* Actions */}
                <td className="py-2 px-3 text-right whitespace-nowrap">
                  <div className="inline-flex items-center gap-1.5">
                    <Link
                      href={`/vehicles/${vehicle.id}`}
                      className="text-blue-700 hover:underline"
                    >
                      View
                    </Link>
                    <span className="text-gray-300">|</span>
                    <Link
                      href={`/vehicles/${vehicle.id}/edit`}
                      className="text-gray-600 hover:underline"
                    >
                      Edit
                    </Link>
                  </div>
                </td>
              </tr>
            ))}

            {filteredVehicles.length === 0 && !loading && (
              <tr>
                <td colSpan={9} className="py-6 text-center text-gray-500">
                  No vehicles found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Assignment Modals */}
      {assignModalConfig && (
        <AssignDriverModal
          isOpen={!!assignModalConfig}
          onClose={() => setAssignModalConfig(null)}
          onSuccess={loadVehicles}
          preselectedVehicleId={assignModalConfig.vehicleId}
          preselectedPosition={assignModalConfig.position}
        />
      )}

      {changeDriverData && (
        <ChangeDriverModal
          isOpen={!!changeDriverData}
          onClose={() => setChangeDriverData(null)}
          onSuccess={loadVehicles}
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
          onSuccess={loadVehicles}
          assignmentId={endAssignmentData.assignmentId}
          vehicleNumber={endAssignmentData.vehicleNumber}
          driverName={endAssignmentData.driverName}
          driverPosition={endAssignmentData.driverPosition}
        />
      )}
    </div>
  );
}
