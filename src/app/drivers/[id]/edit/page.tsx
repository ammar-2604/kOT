"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fleetService } from "@/lib/services/fleetService";
import { Driver } from "@/lib/types";

export default function EditDriverPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const driverId = resolvedParams.id;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Driver | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const details = await fleetService.getDriverDetails(driverId);
        if (details) {
          setFormData(details.driver);
        } else {
          setError("Driver not found.");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load driver.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [driverId]);

  if (loading) {
    return (
      <div className="py-12 text-center text-xs text-gray-500">
        Loading driver record...
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="border border-gray-300 bg-white p-6 text-center">
        <p className="text-red-700 font-bold mb-3">{error || "Driver not found."}</p>
        <Link href="/drivers" className="text-blue-700 font-semibold hover:underline text-xs">
          &larr; Return to Drivers
        </Link>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await fleetService.updateDriver(driverId, {
        name: formData.name,
        driverCode: formData.driverCode,
        fatherName: formData.fatherName,
        mobileNumber: formData.mobileNumber,
        address: formData.address,
        dateOfBirth: formData.dateOfBirth,
        placeOfBirth: formData.placeOfBirth,
        maritalStatus: formData.maritalStatus,
        bloodGroup: formData.bloodGroup,
        education: formData.education,
        cnicNumber: formData.cnicNumber,
        cnicIssueDate: formData.cnicIssueDate,
        cnicExpiryDate: formData.cnicExpiryDate,
        licenseNumber: formData.licenseNumber,
        licenseType: formData.licenseType,
        licenseIssueDate: formData.licenseIssueDate,
        licenseExpiryDate: formData.licenseExpiryDate,
        drivingSince: formData.drivingSince,
      });
      router.push(`/drivers/${driverId}`);
    } catch (err: any) {
      setError(err.message || "Failed to update driver profile.");
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between border-b border-gray-300 pb-2">
        <div>
          <Link
            href={`/drivers/${driverId}`}
            className="text-xs text-gray-600 hover:text-gray-900 font-medium"
          >
            &larr; Return to {formData.name}
          </Link>
          <h1 className="text-base font-bold text-gray-900 mt-1">
            Edit Driver: {formData.name} ({formData.driverCode})
          </h1>
          <p className="text-xs text-gray-500">
            Update personal records, residential address, or licensing information.
          </p>
        </div>
      </div>

      {error && (
        <div className="border border-red-300 bg-red-50 p-2.5 text-xs text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="border border-gray-300 bg-white p-4 space-y-4 text-xs">
        {/* Personal Details */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-200 pb-1.5">
            Personal Details
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Driver Code *
              </label>
              <input
                type="text"
                value={formData.driverCode}
                onChange={(e) => setFormData({ ...formData, driverCode: e.target.value.toUpperCase() })}
                className="w-full border border-gray-300 bg-white px-2.5 py-1.5 font-bold font-mono text-gray-900 focus:outline-none focus:border-blue-700"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 bg-white px-2.5 py-1.5 font-semibold text-gray-900 focus:outline-none focus:border-blue-700"
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
                className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-gray-900 focus:outline-none focus:border-blue-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Mobile Number *
              </label>
              <input
                type="text"
                value={formData.mobileNumber || ""}
                onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-gray-900 focus:outline-none focus:border-blue-700"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                value={formData.dateOfBirth || ""}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-gray-900 focus:outline-none focus:border-blue-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Blood Group
              </label>
              <select
                value={formData.bloodGroup || "O+"}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-gray-900 focus:outline-none focus:border-blue-700"
              >
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
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
              className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-gray-900 focus:outline-none focus:border-blue-700"
            />
          </div>
        </div>

        {/* License & CNIC */}
        <div className="space-y-3 pt-2 border-t border-gray-200">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-200 pb-1.5">
            CNIC & License Credentials
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">CNIC Number</label>
              <input
                type="text"
                value={formData.cnicNumber || ""}
                onChange={(e) => setFormData({ ...formData, cnicNumber: e.target.value })}
                className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-gray-900 font-mono focus:outline-none focus:border-blue-700"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">CNIC Issue Date</label>
              <input
                type="date"
                value={formData.cnicIssueDate || ""}
                onChange={(e) => setFormData({ ...formData, cnicIssueDate: e.target.value })}
                className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-gray-900 focus:outline-none focus:border-blue-700"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">CNIC Expiry Date</label>
              <input
                type="date"
                value={formData.cnicExpiryDate || ""}
                onChange={(e) => setFormData({ ...formData, cnicExpiryDate: e.target.value })}
                className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-gray-900 focus:outline-none focus:border-blue-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">License Number</label>
              <input
                type="text"
                value={formData.licenseNumber || ""}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-gray-900 font-mono font-bold focus:outline-none focus:border-blue-700"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">License Type</label>
              <select
                value={formData.licenseType || "HTV"}
                onChange={(e) => setFormData({ ...formData, licenseType: e.target.value })}
                className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-gray-900 focus:outline-none focus:border-blue-700"
              >
                <option value="HTV">HTV</option>
                <option value="PSV">PSV</option>
                <option value="LTV">LTV</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">License Expiry Date</label>
              <input
                type="date"
                value={formData.licenseExpiryDate || ""}
                onChange={(e) => setFormData({ ...formData, licenseExpiryDate: e.target.value })}
                className="w-full border border-gray-300 bg-white px-2.5 py-1.5 text-gray-900 focus:outline-none focus:border-blue-700"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
          <Link
            href={`/drivers/${driverId}`}
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
