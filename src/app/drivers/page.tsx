"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { fleetService, DriverWithVehicleSummary } from "@/lib/services/fleetService";
import { Driver, Vehicle, VehicleDriverAssignment } from "@/lib/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ExpiryBadge } from "@/components/ui/ExpiryBadge";
import { formatCNIC, formatMobile } from "@/lib/utils/formatters";
import { calculateAge } from "@/lib/utils/dateUtils";
import { ChangeStatusModal } from "@/features/drivers/ChangeStatusModal";
import { AssignDriverModal } from "@/features/assignments/AssignDriverModal";

export default function DriversPage() {
  const [driversData, setDriversData] = useState<DriverWithVehicleSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [assignedFilter, setAssignedFilter] = useState<string>("ALL");

  // Modals
  const [statusModalDriver, setStatusModalDriver] = useState<{
    driver: Driver;
    vehicle: Vehicle | null;
    assignment: VehicleDriverAssignment | null;
  } | null>(null);
  const [assignModalDriverId, setAssignModalDriverId] = useState<string | null>(null);

  const loadDrivers = async () => {
    try {
      setLoading(true);
      const data = await fleetService.getAllDriversWithVehicleInfo();
      setDriversData(data);
    } catch (err) {
      console.error("Failed to load drivers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
    const handleReset = () => loadDrivers();
    window.addEventListener("kot_data_reset", handleReset);
    return () => window.removeEventListener("kot_data_reset", handleReset);
  }, []);

  const filteredDrivers = useMemo(() => {
    return driversData.filter(({ driver, currentVehicle }) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = driver.name.toLowerCase().includes(q);
        const matchCode = driver.driverCode.toLowerCase().includes(q);
        const matchCNIC = (driver.cnicNumber || "").toLowerCase().includes(q);
        const matchMobile = (driver.mobileNumber || "").toLowerCase().includes(q);
        const matchLicense = (driver.licenseNumber || "").toLowerCase().includes(q);
        const matchVeh = (currentVehicle?.vehicleNumber || "").toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchCNIC && !matchMobile && !matchLicense && !matchVeh) {
          return false;
        }
      }

      if (statusFilter !== "ALL" && driver.currentStatus !== statusFilter) {
        return false;
      }

      if (assignedFilter === "ASSIGNED" && !currentVehicle) return false;
      if (assignedFilter === "UNASSIGNED" && currentVehicle) return false;

      return true;
    });
  }, [driversData, searchQuery, statusFilter, assignedFilter]);

  return (
    <div className="space-y-3">
      {/* Title & Top Action */}
      <div className="flex items-center justify-between border-b border-gray-300 pb-2">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-bold text-gray-900">Drivers</h1>
          <span className="text-xs text-gray-500">
            ({driversData.length} total)
          </span>
        </div>

        <Link
          href="/drivers/new"
          className="bg-blue-700 hover:bg-blue-800 text-white px-3 py-1 text-xs font-medium border border-blue-800"
        >
          + Add Driver
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
            placeholder="Driver code, name, CNIC, mobile..."
            className="border border-gray-300 px-2 py-0.5 text-xs text-gray-800 w-56 focus:border-blue-700"
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
            <option value="On Leave">On Leave</option>
            <option value="Suspended">Suspended</option>
            <option value="Resigned">Resigned</option>
            <option value="Terminated">Terminated</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <label className="text-xs text-gray-600">Assignment:</label>
          <select
            value={assignedFilter}
            onChange={(e) => setAssignedFilter(e.target.value)}
            className="border border-gray-300 bg-white px-2 py-0.5 text-xs text-gray-800 focus:border-blue-700"
          >
            <option value="ALL">All Assignment States</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="UNASSIGNED">Unassigned</option>
          </select>
        </div>

        {(searchQuery || statusFilter !== "ALL" || assignedFilter !== "ALL") && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("ALL");
              setAssignedFilter("ALL");
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
              <th className="py-2 px-3 border-r border-gray-200">Code</th>
              <th className="py-2 px-3 border-r border-gray-200">Driver Name</th>
              <th className="py-2 px-3 border-r border-gray-200">CNIC</th>
              <th className="py-2 px-3 border-r border-gray-200">Mobile</th>
              <th className="py-2 px-3 border-r border-gray-200">License</th>
              <th className="py-2 px-3 border-r border-gray-200">Status</th>
              <th className="py-2 px-3 border-r border-gray-200">Current Vehicle</th>
              <th className="py-2 px-3 border-r border-gray-200">Position</th>
              <th className="py-2 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-gray-800">
            {filteredDrivers.map(({ driver, currentVehicle, driverPosition, currentAssignment }) => {
              const age = calculateAge(driver.dateOfBirth);
              return (
                <tr key={driver.id} className="hover:bg-gray-50">
                  {/* Code */}
                  <td className="py-2 px-3 border-r border-gray-200 font-mono text-gray-700">
                    {driver.driverCode}
                  </td>

                  {/* Name */}
                  <td className="py-2 px-3 border-r border-gray-200 font-medium">
                    <Link
                      href={`/drivers/${driver.id}`}
                      className="text-blue-700 hover:underline"
                    >
                      {driver.name}
                    </Link>
                    {age && <span className="text-gray-400 text-[11px] ml-1">({age}y)</span>}
                  </td>

                  {/* CNIC */}
                  <td className="py-2 px-3 border-r border-gray-200 font-mono text-gray-700 whitespace-nowrap">
                    {formatCNIC(driver.cnicNumber)}
                  </td>

                  {/* Mobile */}
                  <td className="py-2 px-3 border-r border-gray-200 text-gray-700 whitespace-nowrap">
                    {formatMobile(driver.mobileNumber)}
                  </td>

                  {/* License */}
                  <td className="py-2 px-3 border-r border-gray-200 whitespace-nowrap">
                    <span className="font-mono text-gray-800">{driver.licenseNumber || "—"}</span>
                    <span className="text-gray-500 text-[11px] ml-1">({driver.licenseType || "HTV"})</span>
                  </td>

                  {/* Status */}
                  <td className="py-2 px-3 border-r border-gray-200">
                    <StatusBadge status={driver.currentStatus} />
                  </td>

                  {/* Current Vehicle */}
                  <td className="py-2 px-3 border-r border-gray-200">
                    {currentVehicle ? (
                      <Link
                        href={`/vehicles/${currentVehicle.id}`}
                        className="text-blue-700 hover:underline font-semibold"
                      >
                        {currentVehicle.vehicleNumber}
                      </Link>
                    ) : (
                      <span className="text-gray-400">Unassigned</span>
                    )}
                  </td>

                  {/* Position */}
                  <td className="py-2 px-3 border-r border-gray-200 text-gray-700">
                    {driverPosition || "—"}
                  </td>

                  {/* Actions */}
                  <td className="py-2 px-3 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      <Link
                        href={`/drivers/${driver.id}`}
                        className="text-blue-700 hover:underline"
                      >
                        Profile
                      </Link>
                      <span className="text-gray-300">|</span>
                      <button
                        type="button"
                        onClick={() => setStatusModalDriver({ driver, vehicle: currentVehicle, assignment: currentAssignment || null })}
                        className="text-gray-700 hover:underline cursor-pointer"
                      >
                        Status
                      </button>
                      {driver.currentStatus === "Active" && !currentVehicle && (
                        <>
                          <span className="text-gray-300">|</span>
                          <button
                            type="button"
                            onClick={() => setAssignModalDriverId(driver.id)}
                            className="text-blue-700 hover:underline cursor-pointer"
                          >
                            Assign
                          </button>
                        </>
                      )}
                      <span className="text-gray-300">|</span>
                      <Link
                        href={`/drivers/${driver.id}/edit`}
                        className="text-gray-600 hover:underline"
                      >
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredDrivers.length === 0 && !loading && (
              <tr>
                <td colSpan={9} className="py-6 text-center text-gray-500">
                  No drivers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Status Modal */}
      {statusModalDriver && (
        <ChangeStatusModal
          isOpen={!!statusModalDriver}
          onClose={() => setStatusModalDriver(null)}
          onSuccess={loadDrivers}
          driver={statusModalDriver.driver}
          currentAssignment={statusModalDriver.assignment}
          assignedVehicleNumber={statusModalDriver.vehicle?.vehicleNumber}
        />
      )}

      {/* Assign Driver Modal */}
      {assignModalDriverId && (
        <AssignDriverModal
          isOpen={!!assignModalDriverId}
          onClose={() => setAssignModalDriverId(null)}
          onSuccess={loadDrivers}
          preselectedDriverId={assignModalDriverId}
        />
      )}
    </div>
  );
}
