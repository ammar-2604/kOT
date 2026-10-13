export type DriverPosition = "Driver 1" | "Driver 2";
export type AssignmentStatus = "Active" | "Completed";

export interface VehicleDriverAssignment {
  id: string;
  vehicleId: string;
  driverId: string;
  driverPosition: DriverPosition;
  assignedFrom: string;
  assignedTo?: string;
  status: AssignmentStatus;
  startReason?: string;
  endReason?: string;
  remarks?: string;
  createdBy: string;
  createdAt: string;
}

export interface CreateAssignmentInput {
  vehicleId: string;
  driverId: string;
  driverPosition: DriverPosition;
  assignedFrom: string;
  startReason?: string;
  remarks?: string;
  createdBy?: string;
}

export interface EndAssignmentInput {
  assignedTo: string;
  endReason: string;
  remarks?: string;
}

export interface ChangeDriverInput {
  vehicleId: string;
  oldAssignmentId: string;
  newDriverId: string;
  driverPosition: DriverPosition;
  endDate: string;
  endReason: string;
  startDate: string;
  startReason?: string;
  remarks?: string;
}
