"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fleetService } from "@/lib/services/fleetService";
import {
  CreateVehicleInput,
  TankCompartment,
  VehicleStatus,
  VehicleType,
} from "@/lib/types";
import { getTodayISODate } from "@/lib/utils/dateUtils";

type StepId = "basic" | "technical" | "compartments" | "capacity" | "review";

export default function NewVehiclePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<StepId>("basic");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<CreateVehicleInput>({
    vehicleNumber: "",
    status: "Active",
    chassisNumber: "",
    engineNumber: "",
    make: "Hino",
    model: "FM1J 6x4",
    vehicleType: "Oil Tanker",
    manufacturingYear: 2022,
    inductionYear: 2022,
    colorBranding: "KOT Standard Livery",
    oem: "Hinopak Motors Pakistan",
    primeMoverType: "6x4",
    bowserQuantity: 1,
    bowserNumber: "",
    bowserInductionYear: 2022,
    hosePower: "260 HP",
    chamberDetail: "4 Compartments High Tensile Steel",
    driveAxle: "Tandem",
    suspensionType: "Multi-leaf Spring",
    brakeType: "Full Air S-Cam with ABS",
    bottomLoading: true,
    trailerWheel: "Steel Disc",
    spareTyreIncluded: true,
    materialTrailer: "Carbon Steel",
    obcTracker: true,
    mdvr: true,
    primeMoverWeight: 8000,
    bowserWeight: 6500,
    oilSum: "24L",
    capacityKL: 44,
    grossVehicleWeight: 42000,
    productWeight: 27500,
    grossCargoWeight: 34000,
    notes: "",
    compartments: [
      { id: "comp-1", compartmentNumber: 1, productType: "PMG", capacityLiters: 11000, dip: "1400 mm", referenceDip: "1400 mm" },
      { id: "comp-2", compartmentNumber: 2, productType: "HSD", capacityLiters: 11000, dip: "1400 mm", referenceDip: "1400 mm" },
      { id: "comp-3", compartmentNumber: 3, productType: "PMG", capacityLiters: 11000, dip: "1400 mm", referenceDip: "1400 mm" },
      { id: "comp-4", compartmentNumber: 4, productType: "HSD", capacityLiters: 11000, dip: "1400 mm", referenceDip: "1400 mm" },
    ],
  });

  const [initialDoc, setInitialDoc] = useState({
    documentType: "Fitness Certificate",
    documentNumber: "FC-SND-2026-001",
    issueDate: getTodayISODate(),
    expiryDate: "2027-10-14",
    issuingAuthority: "Motor Vehicle Examiner",
  });

  const steps: { id: StepId; label: string }[] = [
    { id: "basic", label: "1. Basic Info" },
    { id: "technical", label: "2. Technical Specs" },
    { id: "compartments", label: "3. Tank Chambers" },
    { id: "capacity", label: "4. Weights & Capacity" },
    { id: "review", label: "5. Review & Submit" },
  ];

  const handleAddCompartment = () => {
    const nextNum = formData.compartments.length + 1;
    const newComp: TankCompartment = {
      id: `comp-${Date.now()}`,
      compartmentNumber: nextNum,
      productType: "PMG",
      capacityLiters: 10000,
      dip: "1350 mm",
      referenceDip: "1350 mm",
    };
    setFormData((prev) => ({
      ...prev,
      compartments: [...prev.compartments, newComp],
    }));
  };

  const handleRemoveCompartment = (index: number) => {
    setFormData((prev) => {
      const nextList = prev.compartments.filter((_, idx) => idx !== index);
      return {
        ...prev,
        compartments: nextList.map((c, i) => ({ ...c, compartmentNumber: i + 1 })),
      };
    });
  };

  const handleUpdateCompartment = (index: number, field: keyof TankCompartment, value: any) => {
    setFormData((prev) => {
      const updated = [...prev.compartments];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, compartments: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vehicleNumber.trim()) {
      setError("Vehicle Number is required.");
      setCurrentStep("basic");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const createdVehicle = await fleetService.registerVehicle(formData);

      if (initialDoc.documentType && initialDoc.documentNumber) {
        await fleetService.addVehicleDocument({
          vehicleId: createdVehicle.id,
          documentType: initialDoc.documentType,
          documentNumber: initialDoc.documentNumber,
          issueDate: initialDoc.issueDate,
          expiryDate: initialDoc.expiryDate,
          issuingAuthority: initialDoc.issuingAuthority,
          status: "Valid",
        });
      }

      router.push(`/vehicles/${createdVehicle.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to register vehicle.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-gray-300 pb-2">
        <div>
          <Link
            href="/vehicles"
            className="text-xs text-gray-600 hover:text-gray-900 font-medium"
          >
            &larr; Vehicles
          </Link>
          <h1 className="text-base font-bold text-gray-900 mt-1">
            Register Vehicle
          </h1>
          <p className="text-xs text-gray-500">
            Create a new tanker master record with chamber configurations and compliance documents.
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
                className={`py-2 px-4 font-semibold whitespace-nowrap border-b-2 -mb-px ${
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
          {/* STEP 1: Basic Information */}
          {currentStep === "basic" && (
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-200 pb-1.5">
                1. Basic Information
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Registration / Plate Number *
                  </label>
                  <input
                    type="text"
                    value={formData.vehicleNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })
                    }
                    placeholder="e.g. KOT-111"
                    className="w-full border border-gray-300 bg-white px-2.5 py-1.5 font-bold text-gray-900 focus:outline-none focus:border-blue-700"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Operational Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as VehicleStatus })
                    }
                    className="w-full border border-gray-300 bg-white px-2.5 py-1.5 font-semibold text-gray-900 focus:outline-none focus:border-blue-700"
                  >
                    <option value="Active">Active</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Retired">Retired</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Vehicle Type *
                  </label>
                  <select
                    value={formData.vehicleType}
                    onChange={(e) =>
                      setFormData({ ...formData, vehicleType: e.target.value as VehicleType })
                    }
                    className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-gray-900 focus:outline-none focus:border-blue-700"
                  >
                    <option value="Oil Tanker">Oil Tanker</option>
                    <option value="Prime Mover">Prime Mover</option>
                    <option value="Rigid Tanker">Rigid Tanker</option>
                    <option value="Bowser">Bowser</option>
                    <option value="Trailer">Trailer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Chassis Number
                  </label>
                  <input
                    type="text"
                    value={formData.chassisNumber || ""}
                    onChange={(e) => setFormData({ ...formData, chassisNumber: e.target.value })}
                    className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-gray-900 focus:outline-none focus:border-blue-700 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Engine Number
                  </label>
                  <input
                    type="text"
                    value={formData.engineNumber || ""}
                    onChange={(e) => setFormData({ ...formData, engineNumber: e.target.value })}
                    className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-gray-900 focus:outline-none focus:border-blue-700 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Make
                  </label>
                  <input
                    type="text"
                    value={formData.make}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                    className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-gray-900 focus:outline-none focus:border-blue-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Model
                  </label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-gray-900 focus:outline-none focus:border-blue-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Manufacturing Year
                  </label>
                  <input
                    type="number"
                    value={formData.manufacturingYear || 2022}
                    onChange={(e) => setFormData({ ...formData, manufacturingYear: Number(e.target.value) })}
                    className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-gray-900 focus:outline-none focus:border-blue-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Branding / Livery
                </label>
                <input
                  type="text"
                  value={formData.colorBranding || ""}
                  onChange={(e) => setFormData({ ...formData, colorBranding: e.target.value })}
                  placeholder="e.g. Standard Karachi Oil Trading"
                  className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-gray-900 focus:outline-none focus:border-blue-700"
                />
              </div>

              <div className="flex justify-end pt-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setCurrentStep("technical")}
                  className="border border-blue-700 bg-blue-700 px-4 py-1.5 font-semibold text-white hover:bg-blue-800"
                >
                  Next: Technical Specs &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Technical Specs */}
          {currentStep === "technical" && (
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-200 pb-1.5">
                2. Technical & Mechanical Specs
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Horse Power
                  </label>
                  <input
                    type="text"
                    value={formData.hosePower || ""}
                    onChange={(e) => setFormData({ ...formData, hosePower: e.target.value })}
                    placeholder="e.g. 260 HP"
                    className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-gray-900 focus:outline-none focus:border-blue-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Prime Mover Axle Type
                  </label>
                  <input
                    type="text"
                    value={formData.primeMoverType || ""}
                    onChange={(e) => setFormData({ ...formData, primeMoverType: e.target.value })}
                    placeholder="e.g. 6x4"
                    className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-gray-900 focus:outline-none focus:border-blue-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Brake System
                  </label>
                  <input
                    type="text"
                    value={formData.brakeType || ""}
                    onChange={(e) => setFormData({ ...formData, brakeType: e.target.value })}
                    placeholder="e.g. Full Air S-Cam with ABS"
                    className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-gray-900 focus:outline-none focus:border-blue-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Suspension Type
                  </label>
                  <input
                    type="text"
                    value={formData.suspensionType || ""}
                    onChange={(e) => setFormData({ ...formData, suspensionType: e.target.value })}
                    placeholder="e.g. Multi-leaf spring"
                    className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-gray-900 focus:outline-none focus:border-blue-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Bowser / Tanker Number
                  </label>
                  <input
                    type="text"
                    value={formData.bowserNumber || ""}
                    onChange={(e) => setFormData({ ...formData, bowserNumber: e.target.value })}
                    placeholder="e.g. BOW-44-A"
                    className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-gray-900 focus:outline-none focus:border-blue-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Trailer Material
                  </label>
                  <input
                    type="text"
                    value={formData.materialTrailer || ""}
                    onChange={(e) => setFormData({ ...formData, materialTrailer: e.target.value })}
                    placeholder="e.g. Carbon Steel"
                    className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-gray-900 focus:outline-none focus:border-blue-700"
                  />
                </div>
              </div>

              <div className="border border-gray-200 bg-gray-50 p-3 space-y-2">
                <div className="font-semibold text-gray-800">Hardware & Features</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <label className="flex items-center gap-2 font-medium text-gray-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.bottomLoading}
                      onChange={(e) => setFormData({ ...formData, bottomLoading: e.target.checked })}
                      className="h-3.5 w-3.5 border-gray-300 text-blue-700"
                    />
                    <span>Bottom Loading</span>
                  </label>
                  <label className="flex items-center gap-2 font-medium text-gray-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.obcTracker}
                      onChange={(e) => setFormData({ ...formData, obcTracker: e.target.checked })}
                      className="h-3.5 w-3.5 border-gray-300 text-blue-700"
                    />
                    <span>OBC Tracker</span>
                  </label>
                  <label className="flex items-center gap-2 font-medium text-gray-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.mdvr}
                      onChange={(e) => setFormData({ ...formData, mdvr: e.target.checked })}
                      className="h-3.5 w-3.5 border-gray-300 text-blue-700"
                    />
                    <span>MDVR Camera</span>
                  </label>
                  <label className="flex items-center gap-2 font-medium text-gray-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.spareTyreIncluded}
                      onChange={(e) => setFormData({ ...formData, spareTyreIncluded: e.target.checked })}
                      className="h-3.5 w-3.5 border-gray-300 text-blue-700"
                    />
                    <span>Spare Tyre</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-between pt-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setCurrentStep("basic")}
                  className="border border-gray-300 bg-white px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-50"
                >
                  &larr; Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep("compartments")}
                  className="border border-blue-700 bg-blue-700 px-4 py-1.5 font-semibold text-white hover:bg-blue-800"
                >
                  Next: Tank Chambers &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Compartments */}
          {currentStep === "compartments" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-gray-200 pb-1.5">
                <div className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  3. Calibrated Tank Chambers ({formData.compartments.length})
                </div>
                <button
                  type="button"
                  onClick={handleAddCompartment}
                  className="border border-gray-300 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  + Add Chamber
                </button>
              </div>

              <div className="border border-gray-300 overflow-x-auto">
                <table className="min-w-full text-left text-xs">
                  <thead className="bg-gray-100 border-b border-gray-300 text-gray-700 font-semibold">
                    <tr>
                      <th className="py-2 px-3">Chamber No.</th>
                      <th className="py-2 px-3">Product Cargo</th>
                      <th className="py-2 px-3">Capacity (Liters)</th>
                      <th className="py-2 px-3">Dip</th>
                      <th className="py-2 px-3">Ref Dip</th>
                      <th className="py-2 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {formData.compartments.map((comp, idx) => (
                      <tr key={comp.id} className="hover:bg-gray-50">
                        <td className="py-2 px-3 font-bold text-gray-900">
                          Chamber #{comp.compartmentNumber}
                        </td>
                        <td className="py-2 px-3">
                          <select
                            value={comp.productType}
                            onChange={(e) => handleUpdateCompartment(idx, "productType", e.target.value)}
                            className="border border-gray-300 bg-white px-2 py-1 text-xs"
                          >
                            <option value="PMG">PMG (Super Petrol)</option>
                            <option value="HSD">HSD (High Speed Diesel)</option>
                            <option value="SKO">SKO (Kerosene)</option>
                            <option value="HOBC">HOBC</option>
                          </select>
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            value={comp.capacityLiters}
                            onChange={(e) => handleUpdateCompartment(idx, "capacityLiters", Number(e.target.value))}
                            className="w-24 border border-gray-300 bg-white px-2 py-1 text-xs"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={comp.dip || ""}
                            onChange={(e) => handleUpdateCompartment(idx, "dip", e.target.value)}
                            className="w-24 border border-gray-300 bg-white px-2 py-1 text-xs font-mono"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={comp.referenceDip || ""}
                            onChange={(e) => handleUpdateCompartment(idx, "referenceDip", e.target.value)}
                            className="w-24 border border-gray-300 bg-white px-2 py-1 text-xs font-mono"
                          />
                        </td>
                        <td className="py-2 px-3 text-right">
                          {formData.compartments.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveCompartment(idx)}
                              className="text-red-700 hover:underline font-semibold"
                            >
                              Remove
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between pt-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setCurrentStep("technical")}
                  className="border border-gray-300 bg-white px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-50"
                >
                  &larr; Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep("capacity")}
                  className="border border-blue-700 bg-blue-700 px-4 py-1.5 font-semibold text-white hover:bg-blue-800"
                >
                  Next: Weights & Capacity &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Weights & Capacity */}
          {currentStep === "capacity" && (
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-200 pb-1.5">
                4. Weights & Capacity Parameters
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Rated Capacity (KL) *
                  </label>
                  <input
                    type="number"
                    value={formData.capacityKL || 44}
                    onChange={(e) => setFormData({ ...formData, capacityKL: Number(e.target.value) })}
                    className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-gray-900 font-bold focus:outline-none focus:border-blue-700"
                    required
                  />
                  <p className="mt-0.5 text-[11px] text-gray-500">Total liquid cargo volume in KL</p>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Gross Vehicle Weight (KG)
                  </label>
                  <input
                    type="number"
                    value={formData.grossVehicleWeight || 42000}
                    onChange={(e) => setFormData({ ...formData, grossVehicleWeight: Number(e.target.value) })}
                    className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-gray-900 focus:outline-none focus:border-blue-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Product Net Weight (KG)
                  </label>
                  <input
                    type="number"
                    value={formData.productWeight || 27500}
                    onChange={(e) => setFormData({ ...formData, productWeight: Number(e.target.value) })}
                    className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-gray-900 focus:outline-none focus:border-blue-700"
                  />
                </div>
              </div>

              <div className="border border-gray-200 bg-gray-50 p-3 space-y-2">
                <div className="font-semibold text-gray-800">Initial Compliance Document (Optional)</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Document Type</label>
                    <input
                      type="text"
                      value={initialDoc.documentType}
                      onChange={(e) => setInitialDoc({ ...initialDoc, documentType: e.target.value })}
                      className="w-full border border-gray-300 bg-white px-2 py-1 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Certificate Number</label>
                    <input
                      type="text"
                      value={initialDoc.documentNumber}
                      onChange={(e) => setInitialDoc({ ...initialDoc, documentNumber: e.target.value })}
                      className="w-full border border-gray-300 bg-white px-2 py-1 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Expiry Date</label>
                    <input
                      type="date"
                      value={initialDoc.expiryDate}
                      onChange={(e) => setInitialDoc({ ...initialDoc, expiryDate: e.target.value })}
                      className="w-full border border-gray-300 bg-white px-2 py-1 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  General Fleet Notes
                </label>
                <textarea
                  value={formData.notes || ""}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  placeholder="Optional operational or deployment notes"
                  className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-gray-900 focus:outline-none focus:border-blue-700"
                />
              </div>

              <div className="flex justify-between pt-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setCurrentStep("compartments")}
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

          {/* STEP 5: Review & Submit */}
          {currentStep === "review" && (
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-200 pb-1.5">
                5. Review Vehicle Registration
              </div>

              <div className="border border-gray-300 bg-gray-50 p-3">
                <table className="w-full text-xs">
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="py-1 text-gray-500 w-36">Vehicle Number</td>
                      <td className="py-1 font-bold text-gray-900">{formData.vehicleNumber || "NOT SPECIFIED"}</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-gray-500">Status</td>
                      <td className="py-1 font-semibold text-gray-900">{formData.status}</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-gray-500">Make / Model</td>
                      <td className="py-1 text-gray-900">{formData.make} {formData.model} ({formData.vehicleType})</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-gray-500">Chassis / Engine</td>
                      <td className="py-1 font-mono text-gray-800">{formData.chassisNumber || "—"} / {formData.engineNumber || "—"}</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-gray-500">Capacity</td>
                      <td className="py-1 font-bold text-gray-900">{formData.capacityKL} KL ({formData.compartments.length} Chambers)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between pt-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setCurrentStep("capacity")}
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
                  {loading ? "Registering..." : "Confirm & Save Vehicle"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
