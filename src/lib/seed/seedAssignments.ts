import { VehicleDriverAssignment } from "../types";

export const initialAssignments: VehicleDriverAssignment[] = [
  // KOT-101 (Both Driver 1 and Driver 2 assigned)
  {
    id: "asgn-1",
    vehicleId: "veh-1", // KOT-101
    driverId: "dr-1",   // Ahmed Khan
    driverPosition: "Driver 1",
    assignedFrom: "2026-01-01",
    status: "Active",
    startReason: "Primary Shift Allocation",
    remarks: "Dedicated captain for long haul PARCO Keamari to Machike route.",
    createdBy: "Operations Manager (Karachi Hub)",
    createdAt: "2026-01-01T08:00:00Z",
  },
  {
    id: "asgn-2",
    vehicleId: "veh-1", // KOT-101
    driverId: "dr-2",   // Muhammad Irfan
    driverPosition: "Driver 2",
    assignedFrom: "2026-01-15",
    status: "Active",
    startReason: "Secondary Shift Allocation",
    remarks: "Paired crew captain for mandatory 2-driver continuous pipeline transport.",
    createdBy: "Fleet Dispatcher",
    createdAt: "2026-01-15T09:00:00Z",
  },

  // KOT-102 (Both Driver 1 and Driver 2 assigned)
  {
    id: "asgn-3",
    vehicleId: "veh-2", // KOT-102
    driverId: "dr-3",   // Ali Raza
    driverPosition: "Driver 1",
    assignedFrom: "2026-02-01",
    status: "Active",
    startReason: "Lead Tanker Driver",
    remarks: "Dedicated Shell Shikarpur corridor carriage.",
    createdBy: "Fleet Controller",
    createdAt: "2026-02-01T08:30:00Z",
  },
  {
    id: "asgn-4",
    vehicleId: "veh-2", // KOT-102
    driverId: "dr-4",   // Imran Ahmed
    driverPosition: "Driver 2",
    assignedFrom: "2026-02-15",
    status: "Active",
    startReason: "Co-Driver Duty",
    remarks: "Secondary shift driver for Sindh-Punjab transit.",
    createdBy: "Operations Supervisor",
    createdAt: "2026-02-15T10:00:00Z",
  },

  // KOT-103 (Both Driver 1 and Driver 2 assigned)
  {
    id: "asgn-5",
    vehicleId: "veh-3", // KOT-103
    driverId: "dr-5",   // Nadeem Shah
    driverPosition: "Driver 1",
    assignedFrom: "2026-03-01",
    status: "Active",
    startReason: "Lead Tractor Driver",
    remarks: "High-capacity interstate long-haul route.",
    createdBy: "Fleet Dispatcher",
    createdAt: "2026-03-01T08:00:00Z",
  },
  {
    id: "asgn-6",
    vehicleId: "veh-3", // KOT-103
    driverId: "dr-6",   // Faisal Mehmood
    driverPosition: "Driver 2",
    assignedFrom: "2026-03-10",
    status: "Active",
    startReason: "Co-Driver Duty",
    remarks: "Dual driver operations for 50KL high volume prime mover.",
    createdBy: "Fleet Manager",
    createdAt: "2026-03-10T11:00:00Z",
  },

  // KOT-104 (Both Driver 1 and Driver 2 assigned)
  {
    id: "asgn-7",
    vehicleId: "veh-4", // KOT-104
    driverId: "dr-7",   // Junaid Khan
    driverPosition: "Driver 1",
    assignedFrom: "2026-03-15",
    status: "Active",
    startReason: "Lead Tanker Driver",
    remarks: "Total PARCO Keamari terminal operations.",
    createdBy: "Fleet Dispatcher",
    createdAt: "2026-03-15T09:30:00Z",
  },
  {
    id: "asgn-8",
    vehicleId: "veh-4", // KOT-104
    driverId: "dr-8",   // Bilal Hussain
    driverPosition: "Driver 2",
    assignedFrom: "2026-04-01",
    status: "Active",
    startReason: "Co-Driver Duty",
    remarks: "Secondary shift driver for Keamari bulk transport.",
    createdBy: "Operations Controller",
    createdAt: "2026-04-01T08:00:00Z",
  },

  // Historical Completed Assignments
  {
    id: "asgn-hist-1",
    vehicleId: "veh-1", // KOT-101
    driverId: "dr-2",   // Muhammad Irfan
    driverPosition: "Driver 2",
    assignedFrom: "2025-06-12",
    assignedTo: "2025-12-31",
    status: "Completed",
    startReason: "Previous Crew Assignment",
    endReason: "Transferred",
    remarks: "Completed previous semi-annual crew rotation on KOT-101.",
    createdBy: "Operations Manager",
    createdAt: "2025-06-12T08:00:00Z",
  },
  {
    id: "asgn-hist-2",
    vehicleId: "veh-2", // KOT-102
    driverId: "dr-12",  // Kamran Akhtar (resigned)
    driverPosition: "Driver 1",
    assignedFrom: "2024-03-01",
    assignedTo: "2026-01-14",
    status: "Completed",
    startReason: "Lead Tanker Driver",
    endReason: "Driver Resigned",
    remarks: "Driver submitted resignation to establish family oil retail business.",
    createdBy: "Fleet Controller",
    createdAt: "2024-03-01T08:00:00Z",
  },
  {
    id: "asgn-hist-3",
    vehicleId: "veh-4", // KOT-104
    driverId: "dr-1",   // Ahmed Khan
    driverPosition: "Driver 1",
    assignedFrom: "2024-04-01",
    assignedTo: "2025-12-31",
    status: "Completed",
    startReason: "Original Assignment",
    endReason: "Driver Transferred",
    remarks: "Transferred to KOT-101 as Senior Driver 1.",
    createdBy: "Operations Supervisor",
    createdAt: "2024-04-01T08:00:00Z",
  },
  {
    id: "asgn-hist-4",
    vehicleId: "veh-5", // KOT-105
    driverId: "dr-9",   // Shahid Ali (on leave)
    driverPosition: "Driver 1",
    assignedFrom: "2025-01-10",
    assignedTo: "2026-02-28",
    status: "Completed",
    startReason: "Standard Assignment",
    endReason: "Driver On Leave",
    remarks: "Driver proceeded on medical leave for family emergency.",
    createdBy: "Dispatcher",
    createdAt: "2025-01-10T08:00:00Z",
  },
  {
    id: "asgn-hist-5",
    vehicleId: "veh-9", // KOT-109
    driverId: "dr-11",  // Zeeshan Ahmed (suspended)
    driverPosition: "Driver 1",
    assignedFrom: "2025-08-01",
    assignedTo: "2026-09-28",
    status: "Completed",
    startReason: "Tractor Unit Assignment",
    endReason: "Driver Suspended",
    remarks: "Suspended pending formal inquiry into speeding violation and unauthorized detour.",
    createdBy: "Fleet Safety Director",
    createdAt: "2025-08-01T08:00:00Z",
  },
  {
    id: "asgn-hist-6",
    vehicleId: "veh-3", // KOT-103
    driverId: "dr-10",  // Rashid Iqbal (on leave)
    driverPosition: "Driver 2",
    assignedFrom: "2025-11-01",
    assignedTo: "2026-01-31",
    status: "Completed",
    startReason: "Relief / Co-Driver Duty",
    endReason: "Operational Requirement",
    remarks: "Completed 3 months relief duties during peak harvest diesel demand.",
    createdBy: "Fleet Dispatcher",
    createdAt: "2025-11-01T08:00:00Z",
  },
];
