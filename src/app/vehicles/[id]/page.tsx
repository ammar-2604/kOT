"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { fleetService, VehicleDetailView } from "@/lib/services/fleetService";
import { Driver, VehicleDriverAssignment, DriverPosition } from "@/lib/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ExpiryBadge } from "@/components/ui/ExpiryBadge";
import { Tabs } from "@/components/ui/Tabs";
import { formatDate, calculateDuration, getTodayISODate } from "@/lib/utils/dateUtils";
import { formatCapacityKL, formatWeightKg } from "@/lib/utils/formatters";
import { ActivityTimeline } from "@/components/common/ActivityTimeline";
import { AssignDriverModal } from "@/features/assignments/AssignDriverModal";
import { ChangeDriverModal } from "@/features/assignments/ChangeDriverModal";
import { EndAssignmentModal } from "@/features/assignments/EndAssignmentModal";
import { Modal } from "@/components/ui/Modal";

export default function VehicleProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const vehicleId = resolvedParams.id;

  const [details, setDetails] = useState<VehicleDetailView | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Assignment Modals
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignPosition, setAssignPosition] = useState<DriverPosition>("Driver 1");
  const [changeDriverOpen, setChangeDriverOpen] = useState(false);
  const [changeDriverSlot, setChangeDriverSlot] = useState<{
    driver: Driver;
    assignment: VehicleDriverAssignment;
  } | null>(null);
  const [endAssignmentOpen, setEndAssignmentOpen] = useState(false);
  const [endAssignmentSlot, setEndAssignmentSlot] = useState<{
    driver: Driver;
    assignment: VehicleDriverAssignment;
  } | null>(null);

  // Add Document Modal
  const [addDocOpen, setAddDocOpen] = useState(false);
  const [newDoc, setNewDoc] = useState({
    documentType: "Fitness Certificate",
    documentNumber: "",
    issueDate: getTodayISODate(),
    expiryDate: "",
    issuingAuthority: "Motor Vehicle Examiner",
    remarks: "",
  });

  const loadVehicleDetails = async () => {
    try {
      setLoading(true);
      const data = await fleetService.getVehicleDetails(vehicleId);
      setDetails(data);
    } catch (err) {
      console.error("Failed to load vehicle details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicleDetails();
    const handleReset = () => loadVehicleDetails();
    window.addEventListener("kot_data_reset", handleReset);
    return () => window.removeEventListener("kot_data_reset", handleReset);
  }, [vehicleId]);

  if (loading) {
    return (
      <div className="py-12 text-center text-xs text-gray-500">
        Loading vehicle record...
      </div>
    );
  }

  if (!details) {
    return (
      <div className="border border-gray-300 bg-white p-6 text-center">
        <div className="text-sm font-bold text-gray-900">Vehicle Not Found</div>
        <p className="text-xs text-gray-500 mt-1 mb-3">
          The requested vehicle identifier does not exist or has been removed.
        </p>
        <Link
          href="/vehicles"
          className="border border-gray-300 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100"
        >
          &larr; Back to Vehicles
        </Link>
      </div>
    );
  }

  const { vehicle, drivers, documents, driverHistory, activities } = details;
  const { driver1, driver2 } = drivers;

  const handleSaveDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoc.documentType || !newDoc.documentNumber) return;

    await fleetService.addVehicleDocument({
      vehicleId: vehicle.id,
      documentType: newDoc.documentType,
      documentNumber: newDoc.documentNumber,
      issueDate: newDoc.issueDate || undefined,
      expiryDate: newDoc.expiryDate || undefined,
      issuingAuthority: newDoc.issuingAuthority || undefined,
      remarks: newDoc.remarks || undefined,
      status: "Valid",
    });

    setAddDocOpen(false);
    loadVehicleDetails();
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "technical", label: "Technical Specs" },
    { id: "compartments", label: "Tank Chambers", badge: vehicle.compartments?.length },
    { id: "documents", label: "Documents & Compliance", badge: documents.length },
    { id: "history", label: "Driver History", badge: driverHistory.length },
    { id: "activity", label: "Activity Log" },
  ];

  return (
    <div className="space-y-4">
      {/* Top Toolbar / Breadcrumb */}
      <div className="flex items-center justify-between border-b border-gray-300 pb-2">
        <div className="flex items-center gap-3">
          <Link
            href="/vehicles"
            className="text-xs text-gray-600 hover:text-gray-900 font-medium"
          >
            &larr; Vehicles
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-xs font-bold text-gray-900">{vehicle.vehicleNumber}</span>
          <StatusBadge status={vehicle.status} size="sm" />
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/vehicles/${vehicle.id}/edit`}
            className="border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            Edit Vehicle
          </Link>
        </div>
      </div>

      {/* Vehicle Summary Bar & Drivers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Basic Vehicle Details */}
        <div className="border border-gray-300 bg-white p-3 md:col-span-1">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-600 border-b border-gray-200 pb-1.5 mb-2">
            Vehicle Information
          </div>
          <table className="w-full text-xs">
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="py-1 text-gray-500 w-28">Plate Number</td>
                <td className="py-1 font-bold text-gray-900">{vehicle.vehicleNumber}</td>
              </tr>
              <tr>
                <td className="py-1 text-gray-500">Make / Model</td>
                <td className="py-1 text-gray-800">{vehicle.make} {vehicle.model}</td>
              </tr>
              <tr>
                <td className="py-1 text-gray-500">Vehicle Type</td>
                <td className="py-1 text-gray-800">{vehicle.vehicleType}</td>
              </tr>
              <tr>
                <td className="py-1 text-gray-500">Chassis No.</td>
                <td className="py-1 font-mono text-gray-700">{vehicle.chassisNumber || "—"}</td>
              </tr>
              <tr>
                <td className="py-1 text-gray-500">Engine No.</td>
                <td className="py-1 font-mono text-gray-700">{vehicle.engineNumber || "—"}</td>
              </tr>
              <tr>
                <td className="py-1 text-gray-500">Year</td>
                <td className="py-1 text-gray-800">{vehicle.manufacturingYear || "—"}</td>
              </tr>
              <tr>
                <td className="py-1 text-gray-500">Rated Capacity</td>
                <td className="py-1 font-bold text-gray-900">{formatCapacityKL(vehicle.capacityKL)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Current Assigned Drivers (Two-Driver Operation) */}
        <div className="border border-gray-300 bg-white p-3 md:col-span-2">
          <div className="flex items-center justify-between border-b border-gray-200 pb-1.5 mb-2">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Assigned Drivers (Dual-Driver System)
            </div>
            <div className="text-[11px] text-gray-500">
              Standard 2-crew allocation
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Driver 1 Slot */}
            <div className="border border-gray-200 bg-gray-50 p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs text-blue-900">Driver 1</span>
                {driver1 && (
                  <span className="text-[11px] text-gray-500">
                    Since {formatDate(driver1.assignment.assignedFrom)}
                  </span>
                )}
              </div>

              {driver1 ? (
                <div>
                  <div className="text-xs font-bold text-gray-900">
                    <Link
                      href={`/drivers/${driver1.driver.id}`}
                      className="text-blue-700 hover:underline"
                    >
                      {driver1.driver.name}
                    </Link>{" "}
                    <span className="text-gray-500 font-mono text-[11px]">
                      ({driver1.driver.driverCode})
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-gray-600">
                    Mobile: {driver1.driver.mobileNumber || "—"} | License: {driver1.driver.licenseNumber}
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-200 flex gap-3 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setChangeDriverSlot(driver1);
                        setChangeDriverOpen(true);
                      }}
                      className="text-blue-700 font-medium hover:underline"
                    >
                      Change Driver
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEndAssignmentSlot(driver1);
                        setEndAssignmentOpen(true);
                      }}
                      className="text-red-700 font-medium hover:underline"
                    >
                      End Assignment
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-2">
                  <div className="text-xs text-gray-500 italic">Unassigned slot</div>
                  <button
                    type="button"
                    onClick={() => {
                      setAssignPosition("Driver 1");
                      setAssignModalOpen(true);
                    }}
                    className="mt-2 border border-gray-300 bg-white px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                  >
                    + Assign Driver 1
                  </button>
                </div>
              )}
            </div>

            {/* Driver 2 Slot */}
            <div className="border border-gray-200 bg-gray-50 p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs text-purple-900">Driver 2</span>
                {driver2 && (
                  <span className="text-[11px] text-gray-500">
                    Since {formatDate(driver2.assignment.assignedFrom)}
                  </span>
                )}
              </div>

              {driver2 ? (
                <div>
                  <div className="text-xs font-bold text-gray-900">
                    <Link
                      href={`/drivers/${driver2.driver.id}`}
                      className="text-blue-700 hover:underline"
                    >
                      {driver2.driver.name}
                    </Link>{" "}
                    <span className="text-gray-500 font-mono text-[11px]">
                      ({driver2.driver.driverCode})
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-gray-600">
                    Mobile: {driver2.driver.mobileNumber || "—"} | License: {driver2.driver.licenseNumber}
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-200 flex gap-3 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setChangeDriverSlot(driver2);
                        setChangeDriverOpen(true);
                      }}
                      className="text-blue-700 font-medium hover:underline"
                    >
                      Change Driver
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEndAssignmentSlot(driver2);
                        setEndAssignmentOpen(true);
                      }}
                      className="text-red-700 font-medium hover:underline"
                    >
                      End Assignment
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-2">
                  <div className="text-xs text-gray-500 italic">Unassigned slot</div>
                  <button
                    type="button"
                    onClick={() => {
                      setAssignPosition("Driver 2");
                      setAssignModalOpen(true);
                    }}
                    className="mt-2 border border-gray-300 bg-white px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                  >
                    + Assign Driver 2
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="border border-gray-300 bg-white p-3">
              <div className="text-xs text-gray-500 font-medium">Rated Capacity</div>
              <div className="text-lg font-bold text-gray-900 mt-0.5">
                {formatCapacityKL(vehicle.capacityKL)}
              </div>
              <div className="text-[11px] text-gray-500">
                {(vehicle.capacityKL ? vehicle.capacityKL * 1000 : 0).toLocaleString()} Liters
              </div>
            </div>

            <div className="border border-gray-300 bg-white p-3">
              <div className="text-xs text-gray-500 font-medium">Chambers</div>
              <div className="text-lg font-bold text-gray-900 mt-0.5">
                {vehicle.compartments?.length || 0}
              </div>
              <div className="text-[11px] text-gray-500">Calibrated compartments</div>
            </div>

            <div className="border border-gray-300 bg-white p-3">
              <div className="text-xs text-gray-500 font-medium">Gross Vehicle Weight</div>
              <div className="text-lg font-bold text-gray-900 mt-0.5">
                {formatWeightKg(vehicle.grossVehicleWeight)}
              </div>
              <div className="text-[11px] text-gray-500">
                Product weight: {formatWeightKg(vehicle.productWeight)}
              </div>
            </div>

            <div className="border border-gray-300 bg-white p-3">
              <div className="text-xs text-gray-500 font-medium">Tracking Hardware</div>
              <div className="text-xs font-semibold text-gray-800 mt-1">
                OBC: {vehicle.obcTracker ? "Installed" : "None"} | MDVR: {vehicle.mdvr ? "Installed" : "None"}
              </div>
              <div className="text-[11px] text-gray-500">Safety telematics</div>
            </div>
          </div>

          <div className="border border-gray-300 bg-white p-3">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-600 border-b border-gray-200 pb-1.5 mb-2">
              Operational Notes
            </div>
            <p className="text-xs text-gray-700 leading-normal">
              {vehicle.notes || "Standard fleet tanker allocated for Keamari Marine Terminal and domestic bulk carriage."}
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: TECHNICAL SPECS */}
      {activeTab === "technical" && (
        <div className="border border-gray-300 bg-white p-3">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-600 border-b border-gray-200 pb-1.5 mb-3">
            Technical & Engineering Specifications
          </div>
          <table className="w-full text-xs">
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="py-2 text-gray-500 w-1/3">Horse Power</td>
                <td className="py-2 font-medium text-gray-900">{vehicle.hosePower || "—"}</td>
              </tr>
              <tr>
                <td className="py-2 text-gray-500">Prime Mover Type</td>
                <td className="py-2 font-medium text-gray-900">{vehicle.primeMoverType || "—"}</td>
              </tr>
              <tr>
                <td className="py-2 text-gray-500">Braking System</td>
                <td className="py-2 font-medium text-gray-900">{vehicle.brakeType || "—"}</td>
              </tr>
              <tr>
                <td className="py-2 text-gray-500">Suspension Type</td>
                <td className="py-2 font-medium text-gray-900">{vehicle.suspensionType || "—"}</td>
              </tr>
              <tr>
                <td className="py-2 text-gray-500">Drive Axle</td>
                <td className="py-2 font-medium text-gray-900">{vehicle.driveAxle || "—"}</td>
              </tr>
              <tr>
                <td className="py-2 text-gray-500">Trailer Material</td>
                <td className="py-2 font-medium text-gray-900">{vehicle.materialTrailer || "—"}</td>
              </tr>
              <tr>
                <td className="py-2 text-gray-500">Bowser Number</td>
                <td className="py-2 font-medium text-gray-900">{vehicle.bowserNumber || "—"}</td>
              </tr>
              <tr>
                <td className="py-2 text-gray-500">Bottom Loading</td>
                <td className="py-2 font-medium text-gray-900">
                  {vehicle.bottomLoading ? "Equipped (ADR Standard)" : "Top Hatch Only"}
                </td>
              </tr>
              <tr>
                <td className="py-2 text-gray-500">Spare Tyre</td>
                <td className="py-2 font-medium text-gray-900">
                  {vehicle.spareTyreIncluded ? "Equipped" : "None"}
                </td>
              </tr>
              <tr>
                <td className="py-2 text-gray-500">Tare Weights</td>
                <td className="py-2 font-medium text-gray-900">
                  Prime Mover: {formatWeightKg(vehicle.primeMoverWeight)} | Bowser: {formatWeightKg(vehicle.bowserWeight)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: TANK CHAMBERS */}
      {activeTab === "compartments" && (
        <div className="space-y-3">
          <div className="border border-gray-300 bg-white">
            <div className="bg-gray-100 border-b border-gray-300 px-3 py-2 text-xs font-bold text-gray-700">
              Calibrated Tank Chambers ({vehicle.compartments?.length || 0})
            </div>
            <table className="min-w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
                <tr>
                  <th className="py-2 px-3">Chamber No.</th>
                  <th className="py-2 px-3">Product Allowed</th>
                  <th className="py-2 px-3">Capacity (Liters)</th>
                  <th className="py-2 px-3">Dip (mm)</th>
                  <th className="py-2 px-3">Reference Dip (mm)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-900">
                {vehicle.compartments?.map((comp) => (
                  <tr key={comp.id} className="hover:bg-gray-50">
                    <td className="py-2 px-3 font-bold text-gray-900">
                      Chamber #{comp.compartmentNumber}
                    </td>
                    <td className="py-2 px-3 font-semibold text-gray-800">
                      {comp.productType}
                    </td>
                    <td className="py-2 px-3 font-medium">
                      {comp.capacityLiters.toLocaleString()} L
                    </td>
                    <td className="py-2 px-3 font-mono text-gray-700">
                      {comp.dip || "—"}
                    </td>
                    <td className="py-2 px-3 font-mono text-gray-700">
                      {comp.referenceDip || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: DOCUMENTS & COMPLIANCE */}
      {activeTab === "documents" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-gray-300 pb-2">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Vehicle Compliance Documents ({documents.length})
              </div>
              <div className="text-[11px] text-gray-500">
                Fitness certificates, explosive licenses, and route permits
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAddDocOpen(true)}
              className="border border-gray-300 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              + Add Document
            </button>
          </div>

          <div className="border border-gray-300 bg-white overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-gray-100 border-b border-gray-300 text-gray-700 font-semibold">
                <tr>
                  <th className="py-2 px-3">Document Type</th>
                  <th className="py-2 px-3">Certificate / Number</th>
                  <th className="py-2 px-3">Issue Date</th>
                  <th className="py-2 px-3">Expiry Date</th>
                  <th className="py-2 px-3">Issuing Authority</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-900">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="py-2 px-3 font-semibold text-gray-900">
                      {doc.documentType}
                    </td>
                    <td className="py-2 px-3 font-mono text-gray-700">
                      {doc.documentNumber || "—"}
                    </td>
                    <td className="py-2 px-3 text-gray-600">
                      {formatDate(doc.issueDate)}
                    </td>
                    <td className="py-2 px-3 text-gray-600">
                      {formatDate(doc.expiryDate)}
                    </td>
                    <td className="py-2 px-3 text-gray-700">
                      {doc.issuingAuthority || "—"}
                    </td>
                    <td className="py-2 px-3">
                      <ExpiryBadge expiryDate={doc.expiryDate} />
                    </td>
                    <td className="py-2 px-3 text-gray-600">
                      {doc.remarks || "—"}
                    </td>
                  </tr>
                ))}

                {documents.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-gray-500">
                      No documents currently on file for this vehicle.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: DRIVER HISTORY */}
      {activeTab === "history" && (
        <div className="space-y-3">
          <div className="border-b border-gray-300 pb-2">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Driver Assignment Log ({driverHistory.length})
            </div>
            <div className="text-[11px] text-gray-500">
              Historical records of all drivers allocated to this vehicle
            </div>
          </div>

          <div className="border border-gray-300 bg-white overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-gray-100 border-b border-gray-300 text-gray-700 font-semibold">
                <tr>
                  <th className="py-2 px-3">Driver</th>
                  <th className="py-2 px-3">Position</th>
                  <th className="py-2 px-3">From Date</th>
                  <th className="py-2 px-3">To Date</th>
                  <th className="py-2 px-3">Duration</th>
                  <th className="py-2 px-3">End Reason</th>
                  <th className="py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-900">
                {driverHistory.map(({ assignment, driver }) => (
                  <tr key={assignment.id} className="hover:bg-gray-50">
                    <td className="py-2 px-3">
                      {driver ? (
                        <Link
                          href={`/drivers/${driver.id}`}
                          className="font-bold text-blue-700 hover:underline block"
                        >
                          {driver.name}
                        </Link>
                      ) : (
                        <span className="font-medium text-gray-900">Archived Driver</span>
                      )}
                      <span className="text-[11px] text-gray-500 font-mono">
                        {driver?.driverCode || "—"}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-semibold text-gray-800">
                      {assignment.driverPosition || "Driver 1"}
                    </td>
                    <td className="py-2 px-3 text-gray-700">
                      {formatDate(assignment.assignedFrom)}
                    </td>
                    <td className="py-2 px-3 text-gray-700">
                      {assignment.assignedTo ? formatDate(assignment.assignedTo) : (
                        <span className="font-semibold text-emerald-700">Active</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-gray-600">
                      {calculateDuration(assignment.assignedFrom, assignment.assignedTo)}
                    </td>
                    <td className="py-2 px-3 text-gray-600">
                      {assignment.endReason || "—"}
                    </td>
                    <td className="py-2 px-3">
                      <StatusBadge status={assignment.status} size="sm" />
                    </td>
                  </tr>
                ))}

                {driverHistory.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-gray-500">
                      No assignment history recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: ACTIVITY TIMELINE */}
      {activeTab === "activity" && (
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-300 pb-2">
            Audit Activity Log
          </div>
          <ActivityTimeline activities={activities} />
        </div>
      )}

      {/* Modals */}
      <AssignDriverModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        onSuccess={loadVehicleDetails}
        preselectedVehicleId={vehicle.id}
        preselectedPosition={assignPosition}
      />

      {changeDriverSlot && (
        <ChangeDriverModal
          isOpen={changeDriverOpen}
          onClose={() => {
            setChangeDriverOpen(false);
            setChangeDriverSlot(null);
          }}
          onSuccess={loadVehicleDetails}
          vehicleId={vehicle.id}
          vehicleNumber={vehicle.vehicleNumber}
          currentAssignment={changeDriverSlot.assignment}
          currentDriver={changeDriverSlot.driver}
        />
      )}

      {endAssignmentSlot && (
        <EndAssignmentModal
          isOpen={endAssignmentOpen}
          onClose={() => {
            setEndAssignmentOpen(false);
            setEndAssignmentSlot(null);
          }}
          onSuccess={loadVehicleDetails}
          assignmentId={endAssignmentSlot.assignment.id}
          vehicleNumber={vehicle.vehicleNumber}
          driverName={endAssignmentSlot.driver?.name}
          driverPosition={endAssignmentSlot.assignment.driverPosition}
        />
      )}

      {/* Add Document Modal */}
      <Modal
        isOpen={addDocOpen}
        onClose={() => setAddDocOpen(false)}
        title={`Add Compliance Document — ${vehicle.vehicleNumber}`}
        description="Add inspection certificates, calibration charts, or route permits."
        maxWidth="md"
      >
        <form onSubmit={handleSaveDocument} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Document Type *
            </label>
            <select
              value={newDoc.documentType}
              onChange={(e) => setNewDoc({ ...newDoc, documentType: e.target.value })}
              className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-blue-600"
              required
            >
              <option value="Fitness Certificate">Fitness Certificate</option>
              <option value="Calibration Chart PMG">Calibration Chart PMG</option>
              <option value="Calibration Chart HSD">Calibration Chart HSD</option>
              <option value="Explosive License">Explosive License</option>
              <option value="Sindh Route Permit">Sindh Route Permit</option>
              <option value="Punjab Route Permit">Punjab Route Permit</option>
              <option value="KPK Route Permit">KPK Route Permit</option>
              <option value="Balochistan Route Permit">Balochistan Route Permit</option>
              <option value="Vehicle Insurance">Vehicle Insurance</option>
              <option value="Tracker Certificate">Tracker Certificate</option>
              <option value="MDVR Certificate">MDVR Certificate</option>
              <option value="Hydro Test">Hydro Test</option>
              <option value="Hose Pipe Test">Hose Pipe Test</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Document / Certificate Number *
            </label>
            <input
              type="text"
              value={newDoc.documentNumber}
              onChange={(e) => setNewDoc({ ...newDoc, documentNumber: e.target.value })}
              placeholder="e.g. FC-SND-2026-99"
              className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-blue-600"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Issue Date
              </label>
              <input
                type="date"
                value={newDoc.issueDate}
                onChange={(e) => setNewDoc({ ...newDoc, issueDate: e.target.value })}
                className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Expiry Date *
              </label>
              <input
                type="date"
                value={newDoc.expiryDate}
                onChange={(e) => setNewDoc({ ...newDoc, expiryDate: e.target.value })}
                className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-blue-600"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Issuing Authority
            </label>
            <input
              type="text"
              value={newDoc.issuingAuthority}
              onChange={(e) => setNewDoc({ ...newDoc, issuingAuthority: e.target.value })}
              placeholder="e.g. Motor Vehicle Examiner, Sindh"
              className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Remarks
            </label>
            <textarea
              value={newDoc.remarks}
              onChange={(e) => setNewDoc({ ...newDoc, remarks: e.target.value })}
              rows={2}
              placeholder="Optional notes or remarks"
              className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setAddDocOpen(false)}
              className="border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="border border-blue-700 bg-blue-700 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-800"
            >
              Save Document
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
