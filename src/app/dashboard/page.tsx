"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ExpiryBadge } from "@/components/ui/ExpiryBadge";
import { fleetService, DashboardMetrics, ActiveAssignmentView } from "@/lib/services/fleetService";
import { ExpiringDocumentSummary } from "@/lib/types";
import { formatDate } from "@/lib/utils/dateUtils";
import { AssignDriverModal } from "@/features/assignments/AssignDriverModal";
import { ChangeDriverModal } from "@/features/assignments/ChangeDriverModal";
import { EndAssignmentModal } from "@/features/assignments/EndAssignmentModal";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [activeAssignments, setActiveAssignments] = useState<ActiveAssignmentView[]>([]);
  const [expiringDocs, setExpiringDocs] = useState<ExpiringDocumentSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [changeDriverData, setChangeDriverData] = useState<ActiveAssignmentView | null>(null);
  const [endAssignmentData, setEndAssignmentData] = useState<ActiveAssignmentView | null>(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [m, asgns, docs] = await Promise.all([
        fleetService.getDashboardMetrics(),
        fleetService.getActiveAssignmentsWithDetails(),
        fleetService.getExpiringDocuments(),
      ]);
      setMetrics(m);
      setActiveAssignments(asgns);
      setExpiringDocs(docs);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    const handleReset = () => loadDashboard();
    window.addEventListener("kot_data_reset", handleReset);
    return () => window.removeEventListener("kot_data_reset", handleReset);
  }, []);

  return (
    <div className="space-y-4">
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-300 pb-3">
        <div>
          <h1 className="text-base font-bold text-gray-900">Dashboard</h1>
          <p className="text-xs text-gray-500">Fleet operational summary & driver allocation</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAssignModalOpen(true)}
            className="border border-blue-700 bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800"
          >
            Assign Driver
          </button>
          <Link
            href="/vehicles/new"
            className="border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            Add Vehicle
          </Link>
          <Link
            href="/drivers/new"
            className="border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            Add Driver
          </Link>
        </div>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="border border-gray-300 bg-white p-3">
          <div className="text-xs font-medium text-gray-500">Total Vehicles</div>
          <div className="text-xl font-bold text-gray-900 mt-0.5">
            {metrics ? metrics.totalVehicles : "—"}
          </div>
          <div className="text-[11px] text-gray-500 mt-0.5">
            {metrics?.activeVehicles || 0} active, {metrics?.unassignedVehicles || 0} standby
          </div>
        </div>

        <div className="border border-gray-300 bg-white p-3">
          <div className="text-xs font-medium text-gray-500">Total Drivers</div>
          <div className="text-xl font-bold text-gray-900 mt-0.5">
            {metrics ? metrics.totalDrivers : "—"}
          </div>
          <div className="text-[11px] text-gray-500 mt-0.5">
            {metrics?.activeDrivers || 0} active, {metrics?.driversOnLeave || 0} on leave
          </div>
        </div>

        <div className="border border-gray-300 bg-white p-3">
          <div className="text-xs font-medium text-gray-500">Active Crew Assignments</div>
          <div className="text-xl font-bold text-gray-900 mt-0.5">
            {metrics ? metrics.activeAssignmentsCount : "—"}
          </div>
          <div className="text-[11px] text-gray-500 mt-0.5">
            {metrics?.fullyMannedVehicles || 0} dual crew, {metrics?.partiallyMannedVehicles || 0} single
          </div>
        </div>

        <div className="border border-gray-300 bg-white p-3">
          <div className="text-xs font-medium text-gray-500">Compliance Alerts</div>
          <div className="text-xl font-bold text-amber-700 mt-0.5">
            {expiringDocs.length}
          </div>
          <div className="text-[11px] text-gray-500 mt-0.5">
            Licenses / fitness documents expiring
          </div>
        </div>
      </div>

      {/* Secondary Status Counts */}
      <div className="border border-gray-300 bg-gray-50 px-3 py-2 text-xs flex flex-wrap items-center gap-6 text-gray-700">
        <div>
          <span className="font-semibold text-gray-900">Driver Roster:</span>{" "}
          <span className="text-emerald-700 font-semibold">{metrics?.activeDrivers || 0} Active</span> |{" "}
          <span className="text-amber-700 font-semibold">{metrics?.driversOnLeave || 0} On Leave</span> |{" "}
          <span className="text-red-700 font-semibold">{metrics?.suspendedDrivers || 0} Suspended</span> |{" "}
          <span className="text-gray-500">{metrics?.resignedDrivers || 0} Resigned</span>
        </div>
        <div>
          <span className="font-semibold text-gray-900">Tanker Standby:</span>{" "}
          <span>{metrics?.unassignedVehicles || 0} unassigned</span>
        </div>
      </div>

      {/* Main Grid: Assignments and Driver Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Assignments Table (2 Cols) */}
        <div className="lg:col-span-2 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Active Assignments ({activeAssignments.length})
            </h2>
            <Link href="/assignments" className="text-xs text-blue-700 hover:underline">
              View all assignments &rarr;
            </Link>
          </div>

          <div className="border border-gray-300 bg-white overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-gray-100 border-b border-gray-300 text-gray-700 font-semibold">
                <tr>
                  <th className="py-2 px-3">Vehicle</th>
                  <th className="py-2 px-3">Driver</th>
                  <th className="py-2 px-3">Position</th>
                  <th className="py-2 px-3">Assigned Since</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-900">
                {activeAssignments.map(({ assignment, vehicle, driver }) => (
                  <tr key={assignment.id} className="hover:bg-gray-50">
                    <td className="py-2 px-3">
                      <Link
                        href={`/vehicles/${vehicle.id}`}
                        className="font-bold text-blue-700 hover:underline block"
                      >
                        {vehicle.vehicleNumber}
                      </Link>
                      <span className="text-[11px] text-gray-500">
                        {vehicle.make} {vehicle.model}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <Link
                        href={`/drivers/${driver.id}`}
                        className="font-semibold text-gray-900 hover:underline block"
                      >
                        {driver.name}
                      </Link>
                      <span className="text-[11px] text-gray-500 font-mono">
                        {driver.driverCode}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <span className="font-semibold text-gray-800">
                        {assignment.driverPosition || "Driver 1"}
                      </span>
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap text-gray-600">
                      {formatDate(assignment.assignedFrom)}
                    </td>
                    <td className="py-2 px-3">
                      <StatusBadge status={assignment.status} size="sm" />
                    </td>
                    <td className="py-2 px-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setChangeDriverData({ assignment, vehicle, driver })}
                        className="text-xs font-semibold text-blue-700 hover:underline mr-3"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={() => setEndAssignmentData({ assignment, vehicle, driver })}
                        className="text-xs font-semibold text-red-700 hover:underline"
                      >
                        End
                      </button>
                    </td>
                  </tr>
                ))}

                {activeAssignments.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-gray-500">
                      No active assignments recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Driver Roster Breakdown */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Driver Summary
            </h2>
            <Link href="/drivers" className="text-xs text-blue-700 hover:underline">
              Manage &rarr;
            </Link>
          </div>

          <div className="border border-gray-300 bg-white">
            <table className="min-w-full text-xs text-left">
              <thead className="bg-gray-100 border-b border-gray-300 text-gray-700 font-semibold">
                <tr>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3 text-right">Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-2 px-3 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-600" />
                    <span className="font-medium text-gray-900">Active</span>
                  </td>
                  <td className="py-2 px-3 text-right font-bold text-gray-900">
                    {metrics?.activeDrivers || 0}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <span className="font-medium text-gray-900">On Leave</span>
                  </td>
                  <td className="py-2 px-3 text-right font-bold text-amber-700">
                    {metrics?.driversOnLeave || 0}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-600" />
                    <span className="font-medium text-gray-900">Suspended</span>
                  </td>
                  <td className="py-2 px-3 text-right font-bold text-red-700">
                    {metrics?.suspendedDrivers || 0}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-gray-400" />
                    <span className="font-medium text-gray-900">Resigned / Inactive</span>
                  </td>
                  <td className="py-2 px-3 text-right font-bold text-gray-600">
                    {metrics?.resignedDrivers || 0}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Expiring Documents Section */}
      <div id="expiring-documents" className="space-y-2 pt-2">
        <div className="flex items-center justify-between border-b border-gray-300 pb-2">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Expiring Documents & Compliance Alerts ({expiringDocs.length})
            </h2>
            <p className="text-[11px] text-gray-500">
              Documents expiring within 30 days or overdue for renewal
            </p>
          </div>
        </div>

        <div className="border border-gray-300 bg-white overflow-x-auto">
          <table className="min-w-full text-left text-xs">
            <thead className="bg-gray-100 border-b border-gray-300 text-gray-700 font-semibold">
              <tr>
                <th className="py-2 px-3">Entity</th>
                <th className="py-2 px-3">Type</th>
                <th className="py-2 px-3">Document</th>
                <th className="py-2 px-3">Expiry Date</th>
                <th className="py-2 px-3">Compliance Status</th>
                <th className="py-2 px-3 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-900">
              {expiringDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="py-2 px-3 font-semibold">
                    <Link
                      href={doc.entityType === "vehicle" ? `/vehicles/${doc.entityId}` : `/drivers/${doc.entityId}`}
                      className="text-blue-700 hover:underline"
                    >
                      {doc.entityIdentifier}
                    </Link>
                  </td>
                  <td className="py-2 px-3 text-gray-600 capitalize">
                    {doc.entityType}
                  </td>
                  <td className="py-2 px-3 font-medium text-gray-800">
                    {doc.documentType}
                  </td>
                  <td className="py-2 px-3 whitespace-nowrap text-gray-600">
                    {formatDate(doc.expiryDate)}
                  </td>
                  <td className="py-2 px-3">
                    <ExpiryBadge expiryDate={doc.expiryDate} />
                  </td>
                  <td className="py-2 px-3 text-right">
                    <Link
                      href={doc.entityType === "vehicle" ? `/vehicles/${doc.entityId}` : `/drivers/${doc.entityId}`}
                      className="text-xs font-semibold text-blue-700 hover:underline"
                    >
                      Open &rarr;
                    </Link>
                  </td>
                </tr>
              ))}

              {expiringDocs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-gray-500">
                    No expiring documents found. All documents are currently valid.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assignment Modals */}
      <AssignDriverModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        onSuccess={loadDashboard}
      />

      {changeDriverData && (
        <ChangeDriverModal
          isOpen={!!changeDriverData}
          onClose={() => setChangeDriverData(null)}
          onSuccess={loadDashboard}
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
          onSuccess={loadDashboard}
          assignmentId={endAssignmentData.assignment.id}
          vehicleNumber={endAssignmentData.vehicle.vehicleNumber}
          driverName={endAssignmentData.driver.name}
          driverPosition={endAssignmentData.assignment.driverPosition}
        />
      )}
    </div>
  );
}
