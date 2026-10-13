import { VehicleDocument, DriverDocument } from "../types";

export const initialVehicleDocuments: VehicleDocument[] = [
  // KOT-101
  {
    id: "vdoc-1-1",
    vehicleId: "veh-1",
    documentType: "Fitness Certificate",
    documentNumber: "FC-SND-2025-9812",
    issueDate: "2025-10-20",
    expiryDate: "2026-10-20", // Expiring soon in 6 days!
    issuingAuthority: "Motor Vehicle Examiner, Sindh",
    status: "Expiring Soon",
    remarks: "Inspection scheduled at Baldia testing center.",
  },
  {
    id: "vdoc-1-2",
    vehicleId: "veh-1",
    documentType: "Calibration Chart PMG",
    documentNumber: "CAL-KHI-4412",
    issueDate: "2025-11-15",
    expiryDate: "2026-11-14", // Expiring soon in 31 days
    issuingAuthority: "HDIP / Hydrocarbon Development Institute of Pakistan",
    status: "Expiring Soon",
    remarks: "Dips verified across 4 chambers.",
  },
  {
    id: "vdoc-1-3",
    vehicleId: "veh-1",
    documentType: "Explosive License",
    documentNumber: "EXP-DCP-2024-118",
    issueDate: "2024-05-10",
    expiryDate: "2027-05-09",
    issuingAuthority: "Department of Explosives, Govt. of Pakistan",
    status: "Valid",
    remarks: "Valid for dangerous petroleum transport class I & II.",
  },
  {
    id: "vdoc-1-4",
    vehicleId: "veh-1",
    documentType: "Sindh Route Permit",
    documentNumber: "SRP-2025-88124",
    issueDate: "2025-06-01",
    expiryDate: "2027-05-31",
    issuingAuthority: "Provincial Transport Authority Sindh",
    status: "Valid",
    remarks: "Regular commercial route permit.",
  },
  {
    id: "vdoc-1-5",
    vehicleId: "veh-1",
    documentType: "Tracker Certificate",
    documentNumber: "TRK-TPL-9921",
    issueDate: "2026-01-01",
    expiryDate: "2027-01-01",
    issuingAuthority: "TPL Trakker Ltd",
    status: "Valid",
    remarks: "Integrated real-time GPS & fuel sensors.",
  },

  // KOT-102
  {
    id: "vdoc-2-1",
    vehicleId: "veh-2",
    documentType: "Fitness Certificate",
    documentNumber: "FC-SND-2025-4412",
    issueDate: "2025-09-01",
    expiryDate: "2026-09-01", // Expired ~43 days ago!
    issuingAuthority: "Motor Vehicle Examiner",
    status: "Expired",
    remarks: "Renewal inspection overdue.",
  },
  {
    id: "vdoc-2-2",
    vehicleId: "veh-2",
    documentType: "Vehicle Insurance",
    documentNumber: "INS-EFU-77819",
    issueDate: "2026-02-01",
    expiryDate: "2027-01-31",
    issuingAuthority: "EFU General Insurance",
    status: "Valid",
    remarks: "Comprehensive fleet coverage.",
  },
  {
    id: "vdoc-2-3",
    vehicleId: "veh-2",
    documentType: "Punjab Route Permit",
    documentNumber: "PRP-2025-33190",
    issueDate: "2025-08-15",
    expiryDate: "2026-11-05", // Expiring soon in 22 days
    issuingAuthority: "Punjab Transport Authority",
    status: "Expiring Soon",
    remarks: "Renewal under process.",
  },

  // KOT-103
  {
    id: "vdoc-3-1",
    vehicleId: "veh-3",
    documentType: "Explosive License",
    documentNumber: "EXP-DCP-2025-449",
    issueDate: "2025-03-01",
    expiryDate: "2028-02-28",
    issuingAuthority: "Department of Explosives",
    status: "Valid",
  },
  {
    id: "vdoc-3-2",
    vehicleId: "veh-3",
    documentType: "Hydro Test",
    documentNumber: "HYD-TST-2025-09",
    issueDate: "2025-05-15",
    expiryDate: "2026-10-30", // Expiring soon in 16 days!
    issuingAuthority: "SGS Pakistan Inspection",
    status: "Expiring Soon",
    remarks: "Periodic hydrostatic integrity test.",
  },

  // KOT-104
  {
    id: "vdoc-4-1",
    vehicleId: "veh-4",
    documentType: "Fitness Certificate",
    documentNumber: "FC-SND-2026-1102",
    issueDate: "2026-03-10",
    expiryDate: "2027-03-09",
    issuingAuthority: "Motor Vehicle Examiner",
    status: "Valid",
  },
  {
    id: "vdoc-4-2",
    vehicleId: "veh-4",
    documentType: "Calibration Chart HSD",
    documentNumber: "CAL-HDIP-9902",
    issueDate: "2025-10-05",
    expiryDate: "2026-10-04", // Expired 10 days ago!
    issuingAuthority: "HDIP",
    status: "Expired",
    remarks: "Recalibration needed at Keamari depot.",
  },

  // KOT-105
  {
    id: "vdoc-5-1",
    vehicleId: "veh-5",
    documentType: "Fitness Certificate",
    documentNumber: "FC-SND-2026-5591",
    issueDate: "2026-04-01",
    expiryDate: "2027-03-31",
    issuingAuthority: "Motor Vehicle Examiner",
    status: "Valid",
  },
  {
    id: "vdoc-5-2",
    vehicleId: "veh-5",
    documentType: "Hose Pipe Test",
    documentNumber: "HPT-2026-12",
    issueDate: "2026-04-10",
    expiryDate: "2027-04-09",
    issuingAuthority: "Internal Fleet Workshop",
    status: "Valid",
  },

  // KOT-109 (Under maintenance)
  {
    id: "vdoc-9-1",
    vehicleId: "veh-9",
    documentType: "Fitness Certificate",
    documentNumber: "FC-SND-2025-1992",
    issueDate: "2025-08-20",
    expiryDate: "2026-08-19", // Expired
    issuingAuthority: "Motor Vehicle Examiner",
    status: "Expired",
    remarks: "Awaiting brake overhaul to clear re-test.",
  },
];

export const initialDriverDocuments: DriverDocument[] = [
  // Ahmed Khan (dr-1)
  {
    id: "ddoc-1-1",
    driverId: "dr-1",
    documentType: "DDC (NH&MP)",
    documentNumber: "DDC-NHMP-2024-9912",
    issueDate: "2024-11-10",
    expiryDate: "2026-11-09", // Expiring soon in 26 days!
    issuingAuthority: "National Highways & Motorway Police",
    status: "Expiring Soon",
    remarks: "Scheduled for refresher course at NH&MP Training College.",
  },
  {
    id: "ddoc-1-2",
    driverId: "dr-1",
    documentType: "Medical",
    documentNumber: "MED-KOT-2026-01",
    issueDate: "2026-01-15",
    expiryDate: "2027-01-14",
    issuingAuthority: "Dr. Ziauddin Hospital Occupational Health",
    status: "Valid",
    remarks: "Fit for long-haul tanker driving. Vision 6/6.",
  },
  {
    id: "ddoc-1-3",
    driverId: "dr-1",
    documentType: "Drug & Alcohol Test",
    documentNumber: "DAT-2026-0112",
    testDate: "2026-06-10",
    result: "Negative",
    expiryDate: "2026-12-10",
    issuingAuthority: "Chughtai Lab",
    status: "Valid",
  },
  {
    id: "ddoc-1-4",
    driverId: "dr-1",
    documentType: "Police Verification",
    documentNumber: "PV-SND-88912",
    verificationStatus: "Verified",
    issueDate: "2022-03-01",
    expiryDate: "2027-03-01",
    issuingAuthority: "Special Branch Sindh Police",
    status: "Valid",
  },

  // Muhammad Irfan (dr-2)
  {
    id: "ddoc-2-1",
    driverId: "dr-2",
    documentType: "DDC (NH&MP)",
    documentNumber: "DDC-NHMP-2025-1102",
    issueDate: "2025-05-10",
    expiryDate: "2027-05-09",
    issuingAuthority: "NH&MP",
    status: "Valid",
  },
  {
    id: "ddoc-2-2",
    driverId: "dr-2",
    documentType: "Medical",
    documentNumber: "MED-2025-881",
    issueDate: "2025-09-20",
    expiryDate: "2026-09-19", // Expired ~25 days ago!
    issuingAuthority: "Civil Hospital Karachi",
    status: "Expired",
    remarks: "Annual medical checkup overdue.",
  },

  // Ali Raza (dr-3)
  {
    id: "ddoc-3-1",
    driverId: "dr-3",
    documentType: "DDC (NH&MP)",
    documentNumber: "DDC-NHMP-2025-4491",
    issueDate: "2025-02-14",
    expiryDate: "2027-02-13",
    issuingAuthority: "NH&MP",
    status: "Valid",
  },
  {
    id: "ddoc-3-2",
    driverId: "dr-3",
    documentType: "TPPL Policy",
    documentNumber: "TPPL-EFU-2026-11",
    issueDate: "2026-01-01",
    expiryDate: "2026-12-31",
    issuingAuthority: "EFU General Insurance",
    status: "Valid",
  },

  // Imran Ahmed (dr-4)
  {
    id: "ddoc-4-1",
    driverId: "dr-4",
    documentType: "DDC (NH&MP)",
    documentNumber: "DDC-NHMP-2024-8819",
    issueDate: "2024-10-22",
    expiryDate: "2026-10-22", // Expiring soon in 8 days!
    issuingAuthority: "NH&MP",
    status: "Expiring Soon",
    remarks: "Refresher required.",
  },

  // Rashid Iqbal (dr-10)
  {
    id: "ddoc-10-1",
    driverId: "dr-10",
    documentType: "Medical",
    documentNumber: "MED-2025-339",
    issueDate: "2025-08-10",
    expiryDate: "2026-08-09", // Expired
    issuingAuthority: "Aga Khan Hospital Lab",
    status: "Expired",
  },
];
