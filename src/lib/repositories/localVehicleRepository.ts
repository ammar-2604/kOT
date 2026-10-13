import { VehicleRepository } from "./interfaces";
import { Vehicle, CreateVehicleInput, UpdateVehicleInput } from "../types";
import { storageManager } from "./storageManager";

export class LocalVehicleRepository implements VehicleRepository {
  async getAll(): Promise<Vehicle[]> {
    return storageManager.getVehicles();
  }

  async getById(id: string): Promise<Vehicle | null> {
    const list = storageManager.getVehicles();
    return list.find((v) => v.id === id) || null;
  }

  async getByNumber(vehicleNumber: string): Promise<Vehicle | null> {
    const list = storageManager.getVehicles();
    const clean = vehicleNumber.trim().toUpperCase();
    return list.find((v) => v.vehicleNumber.trim().toUpperCase() === clean) || null;
  }

  async create(input: CreateVehicleInput): Promise<Vehicle> {
    const list = storageManager.getVehicles();
    const id = `veh-${Date.now()}`;
    const now = new Date().toISOString();

    const newVehicle: Vehicle = {
      ...input,
      id,
      vehicleNumber: input.vehicleNumber.trim().toUpperCase(),
      compartments: (input.compartments || []).map((c, idx) => ({
        ...c,
        id: c.id || `comp-${id}-${idx + 1}`,
      })),
      createdAt: now,
      updatedAt: now,
    };

    list.unshift(newVehicle);
    storageManager.saveVehicles(list);
    return newVehicle;
  }

  async update(id: string, input: UpdateVehicleInput): Promise<Vehicle> {
    const list = storageManager.getVehicles();
    const index = list.findIndex((v) => v.id === id);
    if (index === -1) {
      throw new Error(`Vehicle with id ${id} not found`);
    }

    const updated: Vehicle = {
      ...list[index],
      ...input,
      updatedAt: new Date().toISOString(),
    };

    if (input.vehicleNumber) {
      updated.vehicleNumber = input.vehicleNumber.trim().toUpperCase();
    }

    if (input.compartments) {
      updated.compartments = input.compartments.map((c, idx) => ({
        ...c,
        id: c.id || `comp-${id}-${idx + 1}`,
      }));
    }

    list[index] = updated;
    storageManager.saveVehicles(list);
    return updated;
  }
}

export const vehicleRepository = new LocalVehicleRepository();
