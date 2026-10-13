import {
  Vehicle,
  CreateVehicleInput,
  UpdateVehicleInput,
  Driver,
  CreateDriverInput,
  UpdateDriverInput,
  DriverStatusHistory,
  ChangeDriverStatusInput,
  VehicleDriverAssignment,
  CreateAssignmentInput,
  EndAssignmentInput,
  ChangeDriverInput,
  VehicleDocument,
  DriverDocument,
  ExpiringDocumentSummary,
  ActivityEvent,
} from "../types";

export interface VehicleRepository {
  getAll(): Promise<Vehicle[]>;
  getById(id: string): Promise<Vehicle | null>;
  getByNumber(vehicleNumber: string): Promise<Vehicle | null>;
  create(input: CreateVehicleInput): Promise<Vehicle>;
  update(id: string, input: UpdateVehicleInput): Promise<Vehicle>;
}

export interface DriverRepository {
  getAll(): Promise<Driver[]>;
  getById(id: string): Promise<Driver | null>;
  getByCode(driverCode: string): Promise<Driver | null>;
  create(input: CreateDriverInput): Promise<Driver>;
  update(id: string, input: UpdateDriverInput): Promise<Driver>;
  changeStatus(input: ChangeDriverStatusInput): Promise<{ driver: Driver; history: DriverStatusHistory }>;
  getStatusHistory(driverId: string): Promise<DriverStatusHistory[]>;
  getAllStatusHistory(): Promise<DriverStatusHistory[]>;
}

export interface AssignmentRepository {
  getAll(): Promise<VehicleDriverAssignment[]>;
  getActive(): Promise<VehicleDriverAssignment[]>;
  getByVehicleId(vehicleId: string): Promise<VehicleDriverAssignment[]>;
  getByDriverId(driverId: string): Promise<VehicleDriverAssignment[]>;
  getActiveByVehicleId(vehicleId: string): Promise<VehicleDriverAssignment[]>;
  getActiveByVehicleAndPosition(vehicleId: string, position: import("../types").DriverPosition): Promise<VehicleDriverAssignment | null>;
  getActiveByDriverId(driverId: string): Promise<VehicleDriverAssignment | null>;
  create(input: CreateAssignmentInput): Promise<VehicleDriverAssignment>;
  endAssignment(id: string, input: EndAssignmentInput): Promise<VehicleDriverAssignment>;
  changeDriver(input: ChangeDriverInput): Promise<{ endedAssignment: VehicleDriverAssignment; newAssignment: VehicleDriverAssignment }>;
}

export interface DocumentRepository {
  getVehicleDocuments(vehicleId: string): Promise<VehicleDocument[]>;
  getDriverDocuments(driverId: string): Promise<DriverDocument[]>;
  addVehicleDocument(doc: Omit<VehicleDocument, "id">): Promise<VehicleDocument>;
  addDriverDocument(doc: Omit<DriverDocument, "id">): Promise<DriverDocument>;
  getAllVehicleDocuments(): Promise<VehicleDocument[]>;
  getAllDriverDocuments(): Promise<DriverDocument[]>;
  getExpiringDocuments(): Promise<ExpiringDocumentSummary[]>;
}

export interface ActivityRepository {
  getAll(): Promise<ActivityEvent[]>;
  getByEntity(entityType: string, entityId: string): Promise<ActivityEvent[]>;
  add(event: Omit<ActivityEvent, "id">): Promise<ActivityEvent>;
}
