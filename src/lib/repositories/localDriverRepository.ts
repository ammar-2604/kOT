import { DriverRepository } from "./interfaces";
import {
  Driver,
  CreateDriverInput,
  UpdateDriverInput,
  DriverStatusHistory,
  ChangeDriverStatusInput,
} from "../types";
import { storageManager } from "./storageManager";

export class LocalDriverRepository implements DriverRepository {
  async getAll(): Promise<Driver[]> {
    return storageManager.getDrivers();
  }

  async getById(id: string): Promise<Driver | null> {
    const list = storageManager.getDrivers();
    return list.find((d) => d.id === id) || null;
  }

  async getByCode(driverCode: string): Promise<Driver | null> {
    const list = storageManager.getDrivers();
    const clean = driverCode.trim().toUpperCase();
    return list.find((d) => d.driverCode.trim().toUpperCase() === clean) || null;
  }

  async create(input: CreateDriverInput): Promise<Driver> {
    const list = storageManager.getDrivers();
    const id = `dr-${Date.now()}`;
    const now = new Date().toISOString();

    const newDriver: Driver = {
      ...input,
      id,
      driverCode: input.driverCode.trim().toUpperCase(),
      languages: input.languages || [],
      experience: (input.experience || []).map((e, idx) => ({
        ...e,
        id: e.id || `exp-${id}-${idx + 1}`,
      })),
      references: (input.references || []).map((r, idx) => ({
        ...r,
        id: r.id || `ref-${id}-${idx + 1}`,
      })),
      createdAt: now,
      updatedAt: now,
    };

    list.unshift(newDriver);
    storageManager.saveDrivers(list);

    // Also create initial status history event
    const statusHistory = storageManager.getStatusHistory();
    const historyEntry: DriverStatusHistory = {
      id: `dsh-${Date.now()}`,
      driverId: id,
      status: newDriver.currentStatus,
      effectiveFrom: newDriver.inductionDate || now.split("T")[0],
      reason: "Initial Induction Registration",
      remarks: "New driver added to fleet roster.",
      createdAt: now,
      createdBy: "Fleet Operations Admin",
    };
    statusHistory.unshift(historyEntry);
    storageManager.saveStatusHistory(statusHistory);

    return newDriver;
  }

  async update(id: string, input: UpdateDriverInput): Promise<Driver> {
    const list = storageManager.getDrivers();
    const index = list.findIndex((d) => d.id === id);
    if (index === -1) {
      throw new Error(`Driver with id ${id} not found`);
    }

    const updated: Driver = {
      ...list[index],
      ...input,
      updatedAt: new Date().toISOString(),
    };

    if (input.driverCode) {
      updated.driverCode = input.driverCode.trim().toUpperCase();
    }

    if (input.experience) {
      updated.experience = input.experience.map((e, idx) => ({
        ...e,
        id: e.id || `exp-${id}-${idx + 1}`,
      }));
    }

    if (input.references) {
      updated.references = input.references.map((r, idx) => ({
        ...r,
        id: r.id || `ref-${id}-${idx + 1}`,
      }));
    }

    list[index] = updated;
    storageManager.saveDrivers(list);
    return updated;
  }

  async changeStatus(input: ChangeDriverStatusInput): Promise<{ driver: Driver; history: DriverStatusHistory }> {
    const list = storageManager.getDrivers();
    const index = list.findIndex((d) => d.id === input.driverId);
    if (index === -1) {
      throw new Error(`Driver with id ${input.driverId} not found`);
    }

    const now = new Date().toISOString();
    const previousStatus = list[index].currentStatus;

    // Update driver current status
    list[index] = {
      ...list[index],
      currentStatus: input.newStatus,
      updatedAt: now,
    };
    storageManager.saveDrivers(list);

    // Create immutable status history record
    const statusHistory = storageManager.getStatusHistory();
    const historyEntry: DriverStatusHistory = {
      id: `dsh-${Date.now()}`,
      driverId: input.driverId,
      status: input.newStatus,
      effectiveFrom: input.effectiveFrom,
      effectiveTo: input.effectiveTo,
      reason: input.reason,
      remarks: input.remarks || `Status transitioned from ${previousStatus} to ${input.newStatus}`,
      createdAt: now,
      createdBy: input.createdBy || "Operations Dispatcher",
    };

    statusHistory.unshift(historyEntry);
    storageManager.saveStatusHistory(statusHistory);

    return { driver: list[index], history: historyEntry };
  }

  async getStatusHistory(driverId: string): Promise<DriverStatusHistory[]> {
    const list = storageManager.getStatusHistory();
    return list
      .filter((h) => h.driverId === driverId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getAllStatusHistory(): Promise<DriverStatusHistory[]> {
    return storageManager.getStatusHistory();
  }
}

export const driverRepository = new LocalDriverRepository();
