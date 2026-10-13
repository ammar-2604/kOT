import { AssignmentRepository } from "./interfaces";
import {
  VehicleDriverAssignment,
  CreateAssignmentInput,
  EndAssignmentInput,
  ChangeDriverInput,
  DriverPosition,
} from "../types";
import { storageManager } from "./storageManager";

export class LocalAssignmentRepository implements AssignmentRepository {
  async getAll(): Promise<VehicleDriverAssignment[]> {
    const list = storageManager.getAssignments();
    return [...list].sort(
      (a, b) => new Date(b.assignedFrom).getTime() - new Date(a.assignedFrom).getTime()
    );
  }

  async getActive(): Promise<VehicleDriverAssignment[]> {
    const list = storageManager.getAssignments();
    return list.filter((a) => a.status === "Active");
  }

  async getByVehicleId(vehicleId: string): Promise<VehicleDriverAssignment[]> {
    const list = storageManager.getAssignments();
    return list
      .filter((a) => a.vehicleId === vehicleId)
      .sort((a, b) => new Date(b.assignedFrom).getTime() - new Date(a.assignedFrom).getTime());
  }

  async getByDriverId(driverId: string): Promise<VehicleDriverAssignment[]> {
    const list = storageManager.getAssignments();
    return list
      .filter((a) => a.driverId === driverId)
      .sort((a, b) => new Date(b.assignedFrom).getTime() - new Date(a.assignedFrom).getTime());
  }

  async getActiveByVehicleId(vehicleId: string): Promise<VehicleDriverAssignment[]> {
    const list = storageManager.getAssignments();
    return list.filter((a) => a.vehicleId === vehicleId && a.status === "Active");
  }

  async getActiveByVehicleAndPosition(
    vehicleId: string,
    position: DriverPosition
  ): Promise<VehicleDriverAssignment | null> {
    const list = storageManager.getAssignments();
    return (
      list.find(
        (a) =>
          a.vehicleId === vehicleId &&
          a.status === "Active" &&
          a.driverPosition === position
      ) || null
    );
  }

  async getActiveByDriverId(driverId: string): Promise<VehicleDriverAssignment | null> {
    const list = storageManager.getAssignments();
    return list.find((a) => a.driverId === driverId && a.status === "Active") || null;
  }

  async create(input: CreateAssignmentInput): Promise<VehicleDriverAssignment> {
    const list = storageManager.getAssignments();

    // Verification check 1: check if vehicle position (Driver 1 or Driver 2) is already occupied
    const existingPosition = list.find(
      (a) =>
        a.vehicleId === input.vehicleId &&
        a.status === "Active" &&
        a.driverPosition === input.driverPosition
    );
    if (existingPosition) {
      throw new Error(
        `Vehicle already has an active ${input.driverPosition} assigned. End or change that driver first.`
      );
    }

    // Verification check 2: check if driver already has an active vehicle assignment
    const existingDriver = list.find(
      (a) => a.driverId === input.driverId && a.status === "Active"
    );
    if (existingDriver) {
      throw new Error(
        `Driver already has an active assignment as ${existingDriver.driverPosition}.`
      );
    }

    const id = `asgn-${Date.now()}`;
    const now = new Date().toISOString();

    const newAssignment: VehicleDriverAssignment = {
      id,
      vehicleId: input.vehicleId,
      driverId: input.driverId,
      driverPosition: input.driverPosition,
      assignedFrom: input.assignedFrom,
      status: "Active",
      startReason: input.startReason,
      remarks: input.remarks,
      createdBy: input.createdBy || "Operations Dispatcher",
      createdAt: now,
    };

    list.unshift(newAssignment);
    storageManager.saveAssignments(list);
    return newAssignment;
  }

  async endAssignment(id: string, input: EndAssignmentInput): Promise<VehicleDriverAssignment> {
    const list = storageManager.getAssignments();
    const index = list.findIndex((a) => a.id === id);
    if (index === -1) {
      throw new Error(`Assignment ${id} not found`);
    }

    const current = list[index];
    const updated: VehicleDriverAssignment = {
      ...current,
      assignedTo: input.assignedTo,
      endReason: input.endReason,
      remarks: input.remarks ? `${current.remarks || ""} | ${input.remarks}`.trim() : current.remarks,
      status: "Completed",
    };

    list[index] = updated;
    storageManager.saveAssignments(list);
    return updated;
  }

  async changeDriver(input: ChangeDriverInput): Promise<{ endedAssignment: VehicleDriverAssignment; newAssignment: VehicleDriverAssignment }> {
    const list = storageManager.getAssignments();
    const oldIndex = list.findIndex((a) => a.id === input.oldAssignmentId);
    if (oldIndex === -1) {
      throw new Error(`Previous assignment ${input.oldAssignmentId} not found`);
    }

    // 1. Close old assignment
    const oldAsgn = list[oldIndex];
    const endedAssignment: VehicleDriverAssignment = {
      ...oldAsgn,
      assignedTo: input.endDate,
      endReason: input.endReason,
      status: "Completed",
    };
    list[oldIndex] = endedAssignment;

    // 2. Create new assignment
    const newId = `asgn-${Date.now()}`;
    const now = new Date().toISOString();
    const newAssignment: VehicleDriverAssignment = {
      id: newId,
      vehicleId: input.vehicleId,
      driverId: input.newDriverId,
      driverPosition: input.driverPosition,
      assignedFrom: input.startDate,
      status: "Active",
      startReason: input.startReason || "Driver Replacement",
      remarks: input.remarks,
      createdBy: "Fleet Operations Manager",
      createdAt: now,
    };

    list.unshift(newAssignment);
    storageManager.saveAssignments(list);

    return { endedAssignment, newAssignment };
  }
}

export const assignmentRepository = new LocalAssignmentRepository();
