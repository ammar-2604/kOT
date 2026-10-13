"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fleetService } from "@/lib/services/fleetService";
import {
  CreateDriverInput,
  DriverExperience,
  DriverReference,
  DriverStatus,
} from "@/lib/types";
import { getTodayISODate, calculateAge } from "@/lib/utils/dateUtils";

type StepId = "personal" | "license" | "compliance" | "experience" | "references" | "review";

export default function NewDriverPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<StepId>("personal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<CreateDriverInput>({
    driverCode: `DR-00${Math.floor(Math.random() * 80 + 13)}`,
    pkCode: "PK-KOT-NEW",
    inductionDate: getTodayISODate(),
    name: "",
    fatherName: "",
    dateOfBirth: "1990-05-15",
    placeOfBirth: "Karachi",
    address: "Keamari Area, Karachi",
    maritalStatus: "Married",
    bloodGroup: "O+",
    mobileNumber: "0300-1234567",
    education: "Matriculation",
    cnicNumber: "42101-1234567-9",
    cnicIssueDate: "2020-01-01",
    cnicExpiryDate: "2030-01-01",
    cnicVerified: true,
    licenseNumber: "KHI-HTV-99120",
    licenseType: "HTV",
    licenseIssueDate: "2019-06-15",
    licenseExpiryDate: "2028-06-14",
    licenseOnlineVerified: true,
    drivingSince: "2012",
    currentStatus: "Active",
    languages: [
      { language: "Urdu", proficiency: "Fluent" },
      { language: "Pashto", proficiency: "Good" },
    ],
    experience: [
      {
        id: "exp-1",
        companyName: "Al-Haj Petroleum Goods",
        dateFrom: "2018-01-01",
        dateTo: "2023-12-31",
        jobTitle: "Tanker Captain",
        vehicleType: "Hino Heavy Tanker",
        yearsExperience: 5,
        remarks: "Clean driving history.",
      },
    ],
    references: [
      {
        id: "ref-1",
        name: "Muhammad Siddique",
        address: "Maripur Road, Karachi",
        phone: "0321-9988776",
        relation: "Former Supervisor",
      },
    ],
  });

  const [complianceDocs, setComplianceDocs] = useState({
    ddcNumber: "DDC-NHMP-2025-88",
    ddcExpiry: "2027-08-15",
    medExpiry: "2027-04-10",
    drugResult: "Negative",
    policeStatus: "Verified",
  });

  const steps: { id: StepId; label: string }[] = [
    { id: "personal", label: "1. Personal Info" },
    { id: "license", label: "2. CNIC & License" },
    { id: "compliance", label: "3. Compliance" },
    { id: "experience", label: "4. Experience" },
    { id: "references", label: "5. References" },
    { id: "review", label: "6. Review & Submit" },
  ];

  const handleAddExperience = () => {
    setFormData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          id: `exp-${Date.now()}`,
          companyName: "",
          jobTitle: "Tanker Driver",
          vehicleType: "Oil Tanker",
          yearsExperience: 2,
        },
      ],
    }));
  };

  const handleRemoveExperience = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, idx) => idx !== index),
    }));
  };

  const handleUpdateExperience = (index: number, field: keyof DriverExperience, val: any) => {
    setFormData((prev) => {
      const updated = [...prev.experience];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, experience: updated };
    });
  };

  const handleAddReference = () => {
    setFormData((prev) => ({
      ...prev,
      references: [
        ...prev.references,
        {
          id: `ref-${Date.now()}`,
          name: "",
          phone: "",
          relation: "Reference",
        },
      ],
    }));
  };

  const handleRemoveReference = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      references: prev.references.filter((_, idx) => idx !== index),
    }));
  };

  const handleUpdateReference = (index: number, field: keyof DriverReference, val: any) => {
    setFormData((prev) => {
      const updated = [...prev.references];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, references: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Driver Name is required.");
      setCurrentStep("personal");
      return;
    }
    if (!formData.driverCode.trim()) {
      setError("Driver Code is required.");
      setCurrentStep("personal");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newDriver = await fleetService.registerDriver(formData);

      if (complianceDocs.ddcNumber) {
        await fleetService.addDriverDocument({
          driverId: newDriver.id,
          documentType: "DDC (NH&MP)",
          documentNumber: complianceDocs.ddcNumber,
          issueDate: getTodayISODate(),
          expiryDate: complianceDocs.ddcExpiry,
          issuingAuthority: "National Highways & Motorway Police",
          status: "Valid",
        });
      }

      if (complianceDocs.medExpiry) {
        await fleetService.addDriverDocument({
          driverId: newDriver.id,
          documentType: "Medical",
          documentNumber: `MED-${newDriver.driverCode}`,
          issueDate: getTodayISODate(),
          expiryDate: complianceDocs.medExpiry,
          issuingAuthority: "Occupational Health Medical Center",
          status: "Valid",
        });
      }

      router.push(`/drivers/${newDriver.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to register driver.");
      setLoading(false);
    }
  };

  const derivedAge = calculateAge(formData.dateOfBirth);

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-gray-300 pb-2">
        <div>
          <Link
            href="/drivers"
            className="text-xs text-gray-600 hover:text-gray-900 font-medium"
          >
            &larr; Drivers
          </Link>
          <h1 className="text-base font-bold text-gray-900 mt-1">
            Register Driver
          </h1>
          <p className="text-xs text-gray-500">
            Create a master driver record with licensing credentials, compliance certificates, and background verification.
          </p>
        </div>
      </div>

      {error && (
        <div className="border border-red-300 bg-red-50 p-2.5 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Progress Steps Nav */}
      <div className="border border-gray-300 bg-white">
        <div className="flex border-b border-gray-200 overflow-x-auto text-xs">
          {steps.map((s) => {
            const isActive = s.id === currentStep;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setCurrentStep(s.id)}
                className={`py-2 px-3 font-semibold whitespace-nowrap border-b-2 -mb-px ${
                  isActive
                    ? "border-blue-700 text-blue-700 bg-gray-50"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Form Card */}
      <div className="border border-gray-300 bg-white p-4">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* STEP 1: Personal Info */}
          {currentStep === "personal" && (
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-200 pb-1.5">
                1. Personal Identification
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Tariq Mehmood"
                    className="w-full border border-gray-300 bg-white px-2.5 py-1.5 font-bold text-gray-900 focus:outline-none focus:border-blue-700"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Father Name
                  </label>
                  <input
                    type="text"
                    value={formData.fatherName || ""}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    placeholder="e.g. Muhammad Aslam"
                    className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-gray-900 focus:outline-none focus:border-blue-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Driver Code *
                  </label>
                  <input
                    type="text"
                    value={formData.driverCode}
                    onChange={(e) => setFormData({ ...formData, driverCode: e.target.value.toUpperCase() })}
                    className="w-full border border-gray-300 bg-white px-2.5 py-1.5 font-mono font-bold text-gray-900 focus:outline-none focus:border-blue-700"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Current Status *
                  </label>
                  <select
                    value={formData.currentStatus}
                    onChange={(e) => setFormData({ ...formData, currentStatus: e.target.value as DriverStatus })}
                    className="w-full border border-gray-300 bg-white px-2.5 py-1.5 font-semibold text-gray-900 focus:outline-none focus:border-blue-700"
                  >
                    <option value="Active">Active (Eligible for assignment)</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-gray-900 focus:outline-none focus:border-blue-700"
                  />
                  {derivedAge && (
                    <p className="mt-0.5 text-[11px] text-gray-500">Calculated age: {derivedAge} years</p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Blood Group
                  </label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-gray-900 focus:outline-none focus:border-blue-700"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="text"
                    value={formData.mobileNumber}
                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                    placeholder="0300-1234567"
                    className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-gray-900 focus:outline-none focus:border-blue-700"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Domicile / Place of Birth
                  </label>
                  <input
                    type="text"
                    value={formData.placeOfBirth || ""}
                    onChange={(e) => setFormData({ ...formData, placeOfBirth: e.target.value })}
                    placeholder="e.g. Karachi / Mansehra"
                    className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-gray-900 focus:outline-none focus:border-blue-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Education
                  </label>
                  <input
                    type="text"
                    value={formData.education || ""}
                    onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                    placeholder="e.g. Middle / Matric"
                    className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-gray-900 focus:outline-none focus:border-blue-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Residential Address
                </label>
                <input
                  type="text"
                  value={formData.address || ""}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. House No. 12, Keamari, Karachi"
                  className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-gray-900 focus:outline-none focus:border-blue-700"
                />
              </div>

              <div className="flex justify-end pt-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setCurrentStep("license")}
                  className="border border-blue-700 bg-blue-700 px-4 py-1.5 font-semibold text-white hover:bg-blue-800"
                >
                  Next: CNIC & License &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: License & CNIC */}
          {currentStep === "license" && (
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-200 pb-1.5">
                2. CNIC & Commercial Driving License
              </div>

              <div className="border border-gray-200 bg-gray-50 p-3 space-y-2">
                <div className="font-semibold text-gray-800">National Identity Card (CNIC)</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">CNIC Number *</label>
                    <input
                      type="text"
                      value={formData.cnicNumber}
                      onChange={(e) => setFormData({ ...formData, cnicNumber: e.target.value })}
                      placeholder="42101-1234567-1"
                      className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-gray-900 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">CNIC Issue Date</label>
                    <input
                      type="date"
                      value={formData.cnicIssueDate || ""}
                      onChange={(e) => setFormData({ ...formData, cnicIssueDate: e.target.value })}
                      className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">CNIC Expiry Date *</label>
                    <input
                      type="date"
                      value={formData.cnicExpiryDate || ""}
                      onChange={(e) => setFormData({ ...formData, cnicExpiryDate: e.target.value })}
                      className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-gray-900"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 bg-gray-50 p-3 space-y-2">
                <div className="font-semibold text-gray-800">Driving License Credentials</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">License Number *</label>
                    <input
                      type="text"
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                      placeholder="KHI-HTV-00123"
                      className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-gray-900 font-mono font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">License Type</label>
                    <select
                      value={formData.licenseType}
                      onChange={(e) => setFormData({ ...formData, licenseType: e.target.value })}
                      className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-gray-900"
                    >
                      <option value="HTV">HTV (Heavy Transport Vehicle)</option>
                      <option value="LTV">LTV</option>
                      <option value="PSV">PSV</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">License Expiry Date *</label>
                    <input
                      type="date"
                      value={formData.licenseExpiryDate}
                      onChange={(e) => setFormData({ ...formData, licenseExpiryDate: e.target.value })}
                      className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-gray-900 font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">License Issue Date</label>
                    <input
                      type="date"
                      value={formData.licenseIssueDate || ""}
                      onChange={(e) => setFormData({ ...formData, licenseIssueDate: e.target.value })}
                      className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Driving Professionally Since</label>
                    <input
                      type="text"
                      value={formData.drivingSince || "2012"}
                      onChange={(e) => setFormData({ ...formData, drivingSince: e.target.value })}
                      placeholder="e.g. 2012"
                      className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-gray-900"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setCurrentStep("personal")}
                  className="border border-gray-300 bg-white px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-50"
                >
                  &larr; Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep("compliance")}
                  className="border border-blue-700 bg-blue-700 px-4 py-1.5 font-semibold text-white hover:bg-blue-800"
                >
                  Next: Compliance &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Compliance & Safety */}
          {currentStep === "compliance" && (
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-200 pb-1.5">
                3. Compliance & Regulatory Tests
              </div>

              <div className="border border-gray-200 bg-gray-50 p-3 space-y-2">
                <div className="font-semibold text-gray-800">Defensive Driving Course (DDC) Certificate</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Certificate Number</label>
                    <input
                      type="text"
                      value={complianceDocs.ddcNumber}
                      onChange={(e) => setComplianceDocs({ ...complianceDocs, ddcNumber: e.target.value })}
                      className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Expiry Date</label>
                    <input
                      type="date"
                      value={complianceDocs.ddcExpiry}
                      onChange={(e) => setComplianceDocs({ ...complianceDocs, ddcExpiry: e.target.value })}
                      className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-gray-900"
                    />
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 bg-gray-50 p-3 space-y-2">
                <div className="font-semibold text-gray-800">Annual Medical Fitness</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Medical Expiry</label>
                    <input
                      type="date"
                      value={complianceDocs.medExpiry}
                      onChange={(e) => setComplianceDocs({ ...complianceDocs, medExpiry: e.target.value })}
                      className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Drug Test Result</label>
                    <select
                      value={complianceDocs.drugResult}
                      onChange={(e) => setComplianceDocs({ ...complianceDocs, drugResult: e.target.value })}
                      className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-gray-900"
                    >
                      <option value="Negative">Negative (Clean)</option>
                      <option value="Positive">Positive</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Police Verification</label>
                    <select
                      value={complianceDocs.policeStatus}
                      onChange={(e) => setComplianceDocs({ ...complianceDocs, policeStatus: e.target.value })}
                      className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-gray-900"
                    >
                      <option value="Verified">Verified Clear</option>
                      <option value="In Process">In Process</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setCurrentStep("license")}
                  className="border border-gray-300 bg-white px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-50"
                >
                  &larr; Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep("experience")}
                  className="border border-blue-700 bg-blue-700 px-4 py-1.5 font-semibold text-white hover:bg-blue-800"
                >
                  Next: Experience &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Experience */}
          {currentStep === "experience" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-gray-200 pb-1.5">
                <div className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  4. Previous Work Experience ({formData.experience.length})
                </div>
                <button
                  type="button"
                  onClick={handleAddExperience}
                  className="border border-gray-300 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  + Add Experience
                </button>
              </div>

              <div className="border border-gray-300 overflow-x-auto">
                <table className="min-w-full text-left text-xs">
                  <thead className="bg-gray-100 border-b border-gray-300 text-gray-700 font-semibold">
                    <tr>
                      <th className="py-2 px-3">Company</th>
                      <th className="py-2 px-3">Role / Vehicle</th>
                      <th className="py-2 px-3">Years</th>
                      <th className="py-2 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {formData.experience.map((exp, idx) => (
                      <tr key={exp.id} className="hover:bg-gray-50">
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={exp.companyName}
                            onChange={(e) => handleUpdateExperience(idx, "companyName", e.target.value)}
                            placeholder="Company Name"
                            className="w-48 border border-gray-300 bg-white px-2 py-1 text-xs"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={exp.vehicleType || ""}
                            onChange={(e) => handleUpdateExperience(idx, "vehicleType", e.target.value)}
                            placeholder="e.g. Tanker Driver"
                            className="w-40 border border-gray-300 bg-white px-2 py-1 text-xs"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            value={exp.yearsExperience || 1}
                            onChange={(e) => handleUpdateExperience(idx, "yearsExperience", Number(e.target.value))}
                            className="w-16 border border-gray-300 bg-white px-2 py-1 text-xs"
                          />
                        </td>
                        <td className="py-2 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveExperience(idx)}
                            className="text-red-700 hover:underline font-semibold"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between pt-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setCurrentStep("compliance")}
                  className="border border-gray-300 bg-white px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-50"
                >
                  &larr; Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep("references")}
                  className="border border-blue-700 bg-blue-700 px-4 py-1.5 font-semibold text-white hover:bg-blue-800"
                >
                  Next: References &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: References */}
          {currentStep === "references" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-gray-200 pb-1.5">
                <div className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  5. Registered References ({formData.references.length})
                </div>
                <button
                  type="button"
                  onClick={handleAddReference}
                  className="border border-gray-300 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  + Add Reference
                </button>
              </div>

              <div className="border border-gray-300 overflow-x-auto">
                <table className="min-w-full text-left text-xs">
                  <thead className="bg-gray-100 border-b border-gray-300 text-gray-700 font-semibold">
                    <tr>
                      <th className="py-2 px-3">Name</th>
                      <th className="py-2 px-3">Relationship</th>
                      <th className="py-2 px-3">Phone</th>
                      <th className="py-2 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {formData.references.map((ref, idx) => (
                      <tr key={ref.id} className="hover:bg-gray-50">
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={ref.name}
                            onChange={(e) => handleUpdateReference(idx, "name", e.target.value)}
                            placeholder="Full Name"
                            className="w-40 border border-gray-300 bg-white px-2 py-1 text-xs"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={ref.relation || ""}
                            onChange={(e) => handleUpdateReference(idx, "relation", e.target.value)}
                            placeholder="e.g. Former Supervisor"
                            className="w-36 border border-gray-300 bg-white px-2 py-1 text-xs"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={ref.phone}
                            onChange={(e) => handleUpdateReference(idx, "phone", e.target.value)}
                            placeholder="0300-1234567"
                            className="w-36 border border-gray-300 bg-white px-2 py-1 text-xs font-mono"
                          />
                        </td>
                        <td className="py-2 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveReference(idx)}
                            className="text-red-700 hover:underline font-semibold"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between pt-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setCurrentStep("experience")}
                  className="border border-gray-300 bg-white px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-50"
                >
                  &larr; Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep("review")}
                  className="border border-blue-700 bg-blue-700 px-4 py-1.5 font-semibold text-white hover:bg-blue-800"
                >
                  Next: Review & Submit &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: Review */}
          {currentStep === "review" && (
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-200 pb-1.5">
                6. Review Driver Information
              </div>

              <div className="border border-gray-300 bg-gray-50 p-3">
                <table className="w-full text-xs">
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="py-1 text-gray-500 w-36">Driver Name</td>
                      <td className="py-1 font-bold text-gray-900">{formData.name || "NOT SPECIFIED"}</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-gray-500">Driver Code</td>
                      <td className="py-1 font-mono font-bold text-gray-900">{formData.driverCode}</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-gray-500">CNIC</td>
                      <td className="py-1 font-mono text-gray-800">{formData.cnicNumber}</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-gray-500">License</td>
                      <td className="py-1 font-mono text-gray-800">{formData.licenseNumber} ({formData.licenseType})</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-gray-500">Status</td>
                      <td className="py-1 font-semibold text-emerald-800">{formData.currentStatus}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between pt-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setCurrentStep("references")}
                  disabled={loading}
                  className="border border-gray-300 bg-white px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-50"
                >
                  &larr; Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="border border-blue-700 bg-blue-700 px-5 py-1.5 font-semibold text-white hover:bg-blue-800"
                >
                  {loading ? "Registering..." : "Confirm & Save Driver"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
