"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fleetService } from "@/lib/services/fleetService";
import { Vehicle, VehicleStatus, VehicleType } from "@/lib/types";

export default function EditVehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const vehicleId = resolvedParams.id;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Vehicle | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const details = await fleetService.getVehicleDetails(vehicleId);
        if (details) {
          setFormData(details.vehicle);
        } else {
          setError("Vehicle not found.");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load vehicle.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [vehicleId]);

  if (loading) {
    return (
      <div className="py-12 text-center text-xs text-gray-500">
        Loading vehicle record...
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="border border-gray-300 bg-white p-6 text-center">
        <p className="text-red-700 font-bold mb-3">{error || "Vehicle not found."}</p>
        <Link href="/vehicles" className="text-blue-700 font-semibold hover:underline text-xs">
          &larr; Return to Vehicles
        </Link>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await fleetService.updateVehicle(vehicleId, {
        vehicleNumber: formData.vehicleNumber,
        status: formData.status,
        make: formData.make,
        model: formData.model,
        vehicleType: formData.vehicleType,
        chassisNumber: formData.chassisNumber,
        engineNumber: formData.engineNumber,
        manufacturingYear: formData.manufacturingYear,
        inductionYear: formData.inductionYear,
        colorBranding: formData.colorBranding,
        primeMoverType: formData.primeMoverType,
        capacityKL: formData.capacityKL,
        grossVehicleWeight: formData.grossVehicleWeight,
        productWeight: formData.productWeight,
        grossCargoWeight: formData.grossCargoWeight,
        hosePower: formData.hosePower,
        brakeType: formData.brakeType,
        suspensionType: formData.suspensionType,
        bottomLoading: formData.bottomLoading,
        obcTracker: formData.obcTracker,
        mdvr: formData.mdvr,
        notes: formData.notes,
      });
      router.push(`/vehicles/${vehicleId}`);
    } catch (err: any) {
      setError(err.message || "Failed to update vehicle.");
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between border-b border-gray-300 pb-2">
        <div>
          <Link
            href={`/vehicles/${vehicleId}`}
            className="text-xs text-gray-600 hover:text-gray-900 font-medium"
          >
            &larr; Return to {formData.vehicleNumber}
          </Link>
          <h1 className="text-base font-bold text-gray-900 mt-1">
            Edit Vehicle: {formData.vehicleNumber}
          </h1>
          <p className="text-xs text-gray-500">
            Update specifications, mechanical configuration, or operational status.
          </p>
        </div>
      </div>

      {error && (
        <div className="border border-red-300 bg-red-50 p-2.5 text-xs text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="border border-gray-300 bg-white p-4 space-y-4 text-xs">
        {/* Core Identification */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-200 pb-1.5">
            Core Identification & Status
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Plate Number *
              </label>
              <input
                type="text"
                value={formData.vehicleNumber}
                onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })}
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
                onChange={(e) => setFormData({ ...formData, status: e.target.value as VehicleStatus })}
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
                Vehicle Type
              </label>
              <select
                value={formData.vehicleType}
                onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value as VehicleType })}
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
              <label className="block font-semibold text-gray-700 mb-1">Chassis Number</label>
              <input
                type="text"
                value={formData.chassisNumber || ""}
                onChange={(e) => setFormData({ ...formData, chassisNumber: e.target.value })}
                className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-gray-900 focus:outline-none focus:border-blue-700 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Engine Number</label>
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
              <label className="block font-semibold text-gray-700 mb-1">Make</label>
              <input
                type="text"
                value={formData.make || ""}
                onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-gray-900 focus:outline-none focus:border-blue-700"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Model</label>
              <input
                type="text"
                value={formData.model || ""}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-gray-900 focus:outline-none focus:border-blue-700"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Rated Capacity (KL)</label>
              <input
                type="number"
                value={formData.capacityKL || 0}
                onChange={(e) => setFormData({ ...formData, capacityKL: Number(e.target.value) })}
                className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-gray-900 font-bold focus:outline-none focus:border-blue-700"
              />
            </div>
          </div>
        </div>

        {/* Technical Specs */}
        <div className="space-y-3 pt-2 border-t border-gray-200">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-200 pb-1.5">
            Technical & Safety Specs
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Horse Power</label>
              <input
                type="text"
                value={formData.hosePower || ""}
                onChange={(e) => setFormData({ ...formData, hosePower: e.target.value })}
                className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-gray-900 focus:outline-none focus:border-blue-700"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Brake System</label>
              <input
                type="text"
                value={formData.brakeType || ""}
                onChange={(e) => setFormData({ ...formData, brakeType: e.target.value })}
                className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-gray-900 focus:outline-none focus:border-blue-700"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Suspension</label>
              <input
                type="text"
                value={formData.suspensionType || ""}
                onChange={(e) => setFormData({ ...formData, suspensionType: e.target.value })}
                className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-gray-900 focus:outline-none focus:border-blue-700"
              />
            </div>
          </div>

          <div className="border border-gray-200 bg-gray-50 p-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="flex items-center gap-2 font-medium text-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.bottomLoading || false}
                  onChange={(e) => setFormData({ ...formData, bottomLoading: e.target.checked })}
                  className="h-3.5 w-3.5 border-gray-300 text-blue-700"
                />
                <span>Bottom Loading (ADR)</span>
              </label>

              <label className="flex items-center gap-2 font-medium text-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.obcTracker || false}
                  onChange={(e) => setFormData({ ...formData, obcTracker: e.target.checked })}
                  className="h-3.5 w-3.5 border-gray-300 text-blue-700"
                />
                <span>OBC Tracker</span>
              </label>

              <label className="flex items-center gap-2 font-medium text-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.mdvr || false}
                  onChange={(e) => setFormData({ ...formData, mdvr: e.target.checked })}
                  className="h-3.5 w-3.5 border-gray-300 text-blue-700"
                />
                <span>MDVR Cameras</span>
              </label>
            </div>
          </div>
        </div>

        {/* Operational Notes */}
        <div className="pt-2 border-t border-gray-200">
          <label className="block font-semibold text-gray-700 mb-1">Operational Notes</label>
          <textarea
            value={formData.notes || ""}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={2}
            className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-blue-700"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
          <Link
            href={`/vehicles/${vehicleId}`}
            className="border border-gray-300 bg-white px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="border border-blue-700 bg-blue-700 px-4 py-1.5 font-semibold text-white hover:bg-blue-800"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
