"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { fleetService, DriverDetailView } from "@/lib/services/fleetService";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ExpiryBadge } from "@/components/ui/ExpiryBadge";
import { Tabs } from "@/components/ui/Tabs";
import { formatDate, calculateAge, calculateDuration, getTodayISODate } from "@/lib/utils/dateUtils";
import { formatCNIC, formatMobile } from "@/lib/utils/formatters";
import { ActivityTimeline } from "@/components/common/ActivityTimeline";
import { ChangeStatusModal } from "@/features/drivers/ChangeStatusModal";
import { AssignDriverModal } from "@/features/assignments/AssignDriverModal";
import { Modal } from "@/components/ui/Modal";

export default function DriverProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const driverId = resolvedParams.id;

  const [details, setDetails] = useState<DriverDetailView | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Modals
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  // Add Document Modal
  const [addDocOpen, setAddDocOpen] = useState(false);
  const [newDoc, setNewDoc] = useState({
    documentType: "DDC (NH&MP)",
    documentNumber: "",
    issueDate: getTodayISODate(),
    expiryDate: "",
    issuingAuthority: "National Highways & Motorway Police",
    remarks: "",
  });

  const loadDriverDetails = async () => {
    try {
      setLoading(true);
      const data = await fleetService.getDriverDetails(driverId);
      setDetails(data);
    } catch (err) {
      console.error("Failed to load driver details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDriverDetails();
    const handleReset = () => loadDriverDetails();
    window.addEventListener("kot_data_reset", handleReset);
    return () => window.removeEventListener("kot_data_reset", handleReset);
  }, [driverId]);

  if (loading) {
    return (
      <div className="py-12 text-center text-xs text-gray-500">
        Loading driver record...
      </div>
    );
  }

  if (!details) {
    return (
      <div className="border border-gray-300 bg-white p-6 text-center">
        <div className="text-sm font-bold text-gray-900">Driver Not Found</div>
        <p className="text-xs text-gray-500 mt-1 mb-3">
          The requested driver record could not be located in the database.
        </p>
        <Link
          href="/drivers"
          className="border border-gray-300 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100"
        >
          &larr; Back to Drivers
        </Link>
      </div>
    );
  }

  const { driver, currentAssignment, currentVehicle, driverPosition, documents, statusHistory, vehicleHistory, activities } = details;
  const age = calculateAge(driver.dateOfBirth);

  const handleSaveDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoc.documentType || !newDoc.documentNumber) return;

    await fleetService.addDriverDocument({
      driverId: driver.id,
      documentType: newDoc.documentType,
      documentNumber: newDoc.documentNumber,
      issueDate: newDoc.issueDate || undefined,
      expiryDate: newDoc.expiryDate || undefined,
      issuingAuthority: newDoc.issuingAuthority || undefined,
      remarks: newDoc.remarks || undefined,
      status: "Valid",
    });

    setAddDocOpen(false);
    loadDriverDetails();
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "documents", label: "Compliance & Safety", badge: documents.length },
    { id: "vehicle-history", label: "Vehicle History", badge: vehicleHistory.length },
    { id: "status-history", label: "Status History", badge: statusHistory.length },
    { id: "experience", label: "Experience & Languages" },
    { id: "references", label: "References", badge: driver.references?.length },
    { id: "activity", label: "Activity Log" },
  ];

  return (
    <div className="space-y-4">
      {/* Top Toolbar / Breadcrumb */}
      <div className="flex items-center justify-between border-b border-gray-300 pb-2">
        <div className="flex items-center gap-3">
          <Link
            href="/drivers"
            className="text-xs text-gray-600 hover:text-gray-900 font-medium"
          >
            &larr; Drivers
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-xs font-bold text-gray-900">{driver.name}</span>
          <span className="text-xs font-mono text-gray-500">({driver.driverCode})</span>
          <StatusBadge status={driver.currentStatus} size="sm" />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setStatusModalOpen(true)}
            className="border border-amber-600 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100"
          >
            Change Status
          </button>
          {driver.currentStatus === "Active" && !currentVehicle && (
            <button
              type="button"
              onClick={() => setAssignModalOpen(true)}
              className="border border-blue-700 bg-blue-700 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-800"
            >
              Assign Vehicle
            </button>
          )}
          <Link
            href={`/drivers/${driver.id}/edit`}
            className="border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            Edit Driver
          </Link>
        </div>
      </div>

      {/* Driver Summary Bar & Assigned Vehicle */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Personal Details Master */}
        <div className="border border-gray-300 bg-white p-3 md:col-span-1">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-600 border-b border-gray-200 pb-1.5 mb-2">
            Driver Master Info
          </div>
          <table className="w-full text-xs">
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="py-1 text-gray-500 w-28">Driver Code</td>
                <td className="py-1 font-mono font-bold text-gray-900">{driver.driverCode}</td>
              </tr>
              <tr>
                <td className="py-1 text-gray-500">Father Name</td>
                <td className="py-1 text-gray-800">{driver.fatherName || "—"}</td>
              </tr>
              <tr>
                <td className="py-1 text-gray-500">CNIC</td>
                <td className="py-1 font-mono text-gray-800">{formatCNIC(driver.cnicNumber)}</td>
              </tr>
              <tr>
                <td className="py-1 text-gray-500">Mobile</td>
                <td className="py-1 text-gray-800">{formatMobile(driver.mobileNumber)}</td>
              </tr>
              <tr>
                <td className="py-1 text-gray-500">License</td>
                <td className="py-1 font-mono text-gray-800">
                  {driver.licenseNumber} ({driver.licenseType || "HTV"})
                </td>
              </tr>
              <tr>
                <td className="py-1 text-gray-500">License Expiry</td>
                <td className="py-1">
                  <ExpiryBadge expiryDate={driver.licenseExpiryDate} />
                </td>
              </tr>
              <tr>
                <td className="py-1 text-gray-500">Induction Date</td>
                <td className="py-1 text-gray-800">{formatDate(driver.inductionDate)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Current Vehicle Allocation */}
        <div className="border border-gray-300 bg-white p-3 md:col-span-2">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-600 border-b border-gray-200 pb-1.5 mb-2">
            Current Vehicle Assignment
          </div>

          {currentVehicle ? (
            <div className="border border-gray-200 bg-gray-50 p-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-200 pb-2">
                <div>
                  <div className="text-xs text-gray-500">Assigned Tanker:</div>
                  <Link
                    href={`/vehicles/${currentVehicle.id}`}
                    className="text-sm font-bold text-blue-700 hover:underline"
                  >
                    {currentVehicle.vehicleNumber}
                  </Link>
                  <span className="text-xs text-gray-600 ml-2">
                    ({currentVehicle.make} {currentVehicle.model} - {currentVehicle.capacityKL} KL)
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 mr-2">Assigned Position:</span>
                  <span className="font-bold text-xs text-gray-900 border border-gray-300 bg-white px-2 py-0.5">
                    {driverPosition || "Driver 1"}
                  </span>
                </div>
              </div>

              <div className="mt-2 text-xs text-gray-600 flex flex-wrap gap-4">
                <div>
                  <span className="text-gray-500">Assigned Since:</span>{" "}
                  <span className="font-semibold text-gray-800">
                    {formatDate(currentAssignment?.assignedFrom)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>{" "}
                  <span className="font-semibold text-emerald-700">Active Duty</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-gray-200 bg-gray-50 p-4 text-center">
              <div className="text-xs font-medium text-gray-500">
                Driver is currently unassigned (standby roster).
              </div>
              {driver.currentStatus === "Active" && (
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(true)}
                  className="mt-2 border border-blue-700 bg-blue-700 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-800"
                >
                  + Assign Vehicle
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="border border-gray-300 bg-white p-3">
              <div className="text-xs text-gray-500 font-medium">Age</div>
              <div className="text-lg font-bold text-gray-900 mt-0.5">
                {age ? `${age} Yrs` : "—"}
              </div>
              <div className="text-[11px] text-gray-500">DOB: {formatDate(driver.dateOfBirth)}</div>
            </div>

            <div className="border border-gray-300 bg-white p-3">
              <div className="text-xs text-gray-500 font-medium">Blood Group</div>
              <div className="text-lg font-bold text-gray-900 mt-0.5">
                {driver.bloodGroup || "—"}
              </div>
              <div className="text-[11px] text-gray-500">Emergency record</div>
            </div>

            <div className="border border-gray-300 bg-white p-3">
              <div className="text-xs text-gray-500 font-medium">Driving Since</div>
              <div className="text-lg font-bold text-gray-900 mt-0.5">
                {driver.drivingSince || "2010"}
              </div>
              <div className="text-[11px] text-gray-500">Commercial experience</div>
            </div>

            <div className="border border-gray-300 bg-white p-3">
              <div className="text-xs text-gray-500 font-medium">License Expiry</div>
              <div className="mt-1">
                <ExpiryBadge expiryDate={driver.licenseExpiryDate} />
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5">{formatDate(driver.licenseExpiryDate)}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="border border-gray-300 bg-white p-3">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-600 border-b border-gray-200 pb-1.5 mb-2">
                Personal & Residence Information
              </div>
              <table className="w-full text-xs">
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="py-1.5 text-gray-500 w-32">Place of Birth / Domicile</td>
                    <td className="py-1.5 text-gray-800">{driver.placeOfBirth || "—"}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 text-gray-500">Marital Status</td>
                    <td className="py-1.5 text-gray-800">{driver.maritalStatus || "—"}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 text-gray-500">Education</td>
                    <td className="py-1.5 text-gray-800">{driver.education || "—"}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 text-gray-500">Residential Address</td>
                    <td className="py-1.5 text-gray-800">{driver.address || "—"}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="border border-gray-300 bg-white p-3">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-600 border-b border-gray-200 pb-1.5 mb-2">
                Identity & License Verification
              </div>
              <table className="w-full text-xs">
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="py-1.5 text-gray-500 w-32">CNIC Number</td>
                    <td className="py-1.5 font-mono text-gray-900">{formatCNIC(driver.cnicNumber)}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 text-gray-500">CNIC Validity</td>
                    <td className="py-1.5 text-gray-800">
                      {formatDate(driver.cnicIssueDate)} to {formatDate(driver.cnicExpiryDate)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1.5 text-gray-500">License Number</td>
                    <td className="py-1.5 font-mono text-gray-900">{driver.licenseNumber}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 text-gray-500">License Type / Validity</td>
                    <td className="py-1.5 text-gray-800">
                      {driver.licenseType || "HTV"} • Expires {formatDate(driver.licenseExpiryDate)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COMPLIANCE & SAFETY DOCUMENTS */}
      {activeTab === "documents" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-gray-300 pb-2">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Driver Compliance Documents ({documents.length})
              </div>
              <div className="text-[11px] text-gray-500">
                DDC, medical fitness, drug tests, and police verification
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
                  <th className="py-2 px-3">Issue / Test Date</th>
                  <th className="py-2 px-3">Expiry Date</th>
                  <th className="py-2 px-3">Issuing Authority</th>
                  <th className="py-2 px-3">Status / Result</th>
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
                      {formatDate(doc.issueDate || doc.testDate)}
                    </td>
                    <td className="py-2 px-3 text-gray-600">
                      {formatDate(doc.expiryDate)}
                    </td>
                    <td className="py-2 px-3 text-gray-700">
                      {doc.issuingAuthority || "—"}
                    </td>
                    <td className="py-2 px-3">
                      {doc.result ? (
                        <span className="font-semibold text-emerald-800">{doc.result}</span>
                      ) : (
                        <ExpiryBadge expiryDate={doc.expiryDate} />
                      )}
                    </td>
                    <td className="py-2 px-3 text-gray-600">
                      {doc.remarks || "—"}
                    </td>
                  </tr>
                ))}

                {documents.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-gray-500">
                      No documents currently on file for this driver.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: VEHICLE HISTORY */}
      {activeTab === "vehicle-history" && (
        <div className="space-y-3">
          <div className="border-b border-gray-300 pb-2">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Vehicle Assignment History ({vehicleHistory.length})
            </div>
            <div className="text-[11px] text-gray-500">
              All previous and current vehicles assigned to this driver
            </div>
          </div>

          <div className="border border-gray-300 bg-white overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-gray-100 border-b border-gray-300 text-gray-700 font-semibold">
                <tr>
                  <th className="py-2 px-3">Vehicle</th>
                  <th className="py-2 px-3">Type</th>
                  <th className="py-2 px-3">Driver Position</th>
                  <th className="py-2 px-3">From Date</th>
                  <th className="py-2 px-3">To Date</th>
                  <th className="py-2 px-3">Duration</th>
                  <th className="py-2 px-3">End Reason</th>
                  <th className="py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-900">
                {vehicleHistory.map(({ assignment, vehicle }) => (
                  <tr key={assignment.id} className="hover:bg-gray-50">
                    <td className="py-2 px-3">
                      {vehicle ? (
                        <Link
                          href={`/vehicles/${vehicle.id}`}
                          className="font-bold text-blue-700 hover:underline block"
                        >
                          {vehicle.vehicleNumber}
                        </Link>
                      ) : (
                        <span className="font-medium text-gray-900">Archived Vehicle</span>
                      )}
                      <span className="text-[11px] text-gray-500">
                        {vehicle?.make} {vehicle?.model}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-gray-700">
                      {vehicle?.vehicleType || "Tanker"}
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

                {vehicleHistory.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-gray-500">
                      No vehicle assignments recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: STATUS HISTORY */}
      {activeTab === "status-history" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-gray-300 pb-2">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Status Lifecycle Audit Trail ({statusHistory.length})
              </div>
              <div className="text-[11px] text-gray-500">
                Official records of leaves, suspensions, reinstatements, and resignations
              </div>
            </div>
            <button
              type="button"
              onClick={() => setStatusModalOpen(true)}
              className="border border-amber-600 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100"
            >
              + Change Status
            </button>
          </div>

          <div className="border border-gray-300 bg-white overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-gray-100 border-b border-gray-300 text-gray-700 font-semibold">
                <tr>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Effective From</th>
                  <th className="py-2 px-3">Effective To</th>
                  <th className="py-2 px-3">Reason</th>
                  <th className="py-2 px-3">Remarks</th>
                  <th className="py-2 px-3">Recorded By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-900">
                {statusHistory.map((hist) => (
                  <tr key={hist.id} className="hover:bg-gray-50">
                    <td className="py-2 px-3">
                      <StatusBadge status={hist.status} size="sm" />
                    </td>
                    <td className="py-2 px-3 font-medium text-gray-900">
                      {formatDate(hist.effectiveFrom)}
                    </td>
                    <td className="py-2 px-3 text-gray-600">
                      {hist.effectiveTo ? formatDate(hist.effectiveTo) : "—"}
                    </td>
                    <td className="py-2 px-3 text-gray-800">
                      {hist.reason || "—"}
                    </td>
                    <td className="py-2 px-3 text-gray-600">
                      {hist.remarks || "—"}
                    </td>
                    <td className="py-2 px-3 text-gray-600">
                      {hist.createdBy || "Operations"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: EXPERIENCE & LANGUAGES */}
      {activeTab === "experience" && (
        <div className="space-y-3">
          <div className="border border-gray-300 bg-white p-3">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-600 border-b border-gray-200 pb-1.5 mb-2">
              Spoken Languages
            </div>
            <div className="flex flex-wrap gap-2">
              {driver.languages?.map((lang, idx) => (
                <div
                  key={idx}
                  className="border border-gray-300 bg-gray-50 px-2 py-1 text-xs"
                >
                  <span className="font-semibold text-gray-800">{lang.language}:</span>{" "}
                  <span className="text-gray-600">{lang.proficiency}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-gray-300 bg-white">
            <div className="bg-gray-100 border-b border-gray-300 px-3 py-2 text-xs font-bold text-gray-700">
              Previous Employment History
            </div>
            <table className="min-w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
                <tr>
                  <th className="py-2 px-3">Employer / Company</th>
                  <th className="py-2 px-3">Vehicle Type / Job</th>
                  <th className="py-2 px-3">From Date</th>
                  <th className="py-2 px-3">To Date</th>
                  <th className="py-2 px-3">Experience</th>
                  <th className="py-2 px-3">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-900">
                {driver.experience?.map((exp) => (
                  <tr key={exp.id} className="hover:bg-gray-50">
                    <td className="py-2 px-3 font-semibold text-gray-900">{exp.companyName}</td>
                    <td className="py-2 px-3">{exp.vehicleType || exp.jobTitle}</td>
                    <td className="py-2 px-3 text-gray-600">{formatDate(exp.dateFrom)}</td>
                    <td className="py-2 px-3 text-gray-600">{formatDate(exp.dateTo)}</td>
                    <td className="py-2 px-3 font-medium text-gray-900">{exp.yearsExperience} Years</td>
                    <td className="py-2 px-3 text-gray-600">{exp.remarks || "—"}</td>
                  </tr>
                ))}

                {(!driver.experience || driver.experience.length === 0) && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-gray-500">
                      No previous work experience recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: REFERENCES */}
      {activeTab === "references" && (
        <div className="border border-gray-300 bg-white">
          <div className="bg-gray-100 border-b border-gray-300 px-3 py-2 text-xs font-bold text-gray-700">
            Registered References ({driver.references?.length || 0})
          </div>
          <table className="min-w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
              <tr>
                <th className="py-2 px-3">Name</th>
                <th className="py-2 px-3">Relationship</th>
                <th className="py-2 px-3">Phone</th>
                <th className="py-2 px-3">Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-900">
              {driver.references?.map((ref) => (
                <tr key={ref.id} className="hover:bg-gray-50">
                  <td className="py-2 px-3 font-semibold text-gray-900">{ref.name}</td>
                  <td className="py-2 px-3 text-gray-700">{ref.relation || "Reference"}</td>
                  <td className="py-2 px-3 font-mono text-gray-700">{ref.phone || "—"}</td>
                  <td className="py-2 px-3 text-gray-600">{ref.address || "—"}</td>
                </tr>
              ))}

              {(!driver.references || driver.references.length === 0) && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-gray-500">
                    No references registered for this driver.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 7: ACTIVITY AUDIT LOG */}
      {activeTab === "activity" && (
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-300 pb-2">
            Audit Activity Log
          </div>
          <ActivityTimeline activities={activities} />
        </div>
      )}

      {/* Modals */}
      <ChangeStatusModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        onSuccess={loadDriverDetails}
        driver={driver}
        currentAssignment={currentAssignment}
        assignedVehicleNumber={currentVehicle?.vehicleNumber}
      />

      <AssignDriverModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        onSuccess={loadDriverDetails}
        preselectedDriverId={driver.id}
      />

      {/* Add Document Modal */}
      <Modal
        isOpen={addDocOpen}
        onClose={() => setAddDocOpen(false)}
        title={`Add Compliance Document — ${driver.name}`}
        description="Add DDC certifications, medical records, or safety verifications."
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
              <option value="DDC (NH&MP)">DDC (NH&MP Defensive Driving)</option>
              <option value="Medical">Medical Certificate</option>
              <option value="Random Medical">Random Medical Screen</option>
              <option value="Drug & Alcohol Test">Drug & Alcohol Test</option>
              <option value="Police Verification">Police Verification</option>
              <option value="TPPL Policy">TPPL Policy</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Certificate / Document Number *
            </label>
            <input
              type="text"
              value={newDoc.documentNumber}
              onChange={(e) => setNewDoc({ ...newDoc, documentNumber: e.target.value })}
              placeholder="e.g. DDC-2026-991"
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
              placeholder="e.g. NH&MP, Chughtai Lab, Special Branch"
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
