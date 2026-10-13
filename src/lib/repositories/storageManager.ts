import {
  Vehicle,
  Driver,
  VehicleDriverAssignment,
  DriverStatusHistory,
  VehicleDocument,
  DriverDocument,
  ActivityEvent,
} from "../types";
import {
  initialVehicles,
  initialDrivers,
  initialAssignments,
  initialStatusHistory,
  initialVehicleDocuments,
  initialDriverDocuments,
  initialActivities,
} from "../seed";

const KEYS = {
  VEHICLES: "kot_fleet_vehicles_v1",
  DRIVERS: "kot_fleet_drivers_v1",
  ASSIGNMENTS: "kot_fleet_assignments_v2",
  STATUS_HISTORY: "kot_fleet_status_history_v1",
  VEHICLE_DOCS: "kot_fleet_vehicle_docs_v1",
  DRIVER_DOCS: "kot_fleet_driver_docs_v1",
  ACTIVITIES: "kot_fleet_activities_v1",
};

class StorageManager {
  private isBrowser(): boolean {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  }

  // Vehicles
  getVehicles(): Vehicle[] {
    if (!this.isBrowser()) return initialVehicles;
    try {
      const stored = localStorage.getItem(KEYS.VEHICLES);
      if (!stored) {
        this.saveVehicles(initialVehicles);
        return initialVehicles;
      }
      return JSON.parse(stored);
    } catch {
      return initialVehicles;
    }
  }

  saveVehicles(data: Vehicle[]): void {
    if (this.isBrowser()) {
      localStorage.setItem(KEYS.VEHICLES, JSON.stringify(data));
    }
  }

  // Drivers
  getDrivers(): Driver[] {
    if (!this.isBrowser()) return initialDrivers;
    try {
      const stored = localStorage.getItem(KEYS.DRIVERS);
      if (!stored) {
        this.saveDrivers(initialDrivers);
        return initialDrivers;
      }
      return JSON.parse(stored);
    } catch {
      return initialDrivers;
    }
  }

  saveDrivers(data: Driver[]): void {
    if (this.isBrowser()) {
      localStorage.setItem(KEYS.DRIVERS, JSON.stringify(data));
    }
  }

  // Assignments
  getAssignments(): VehicleDriverAssignment[] {
    if (!this.isBrowser()) return initialAssignments;
    try {
      const stored = localStorage.getItem(KEYS.ASSIGNMENTS);
      if (!stored) {
        this.saveAssignments(initialAssignments);
        return initialAssignments;
      }
      return JSON.parse(stored);
    } catch {
      return initialAssignments;
    }
  }

  saveAssignments(data: VehicleDriverAssignment[]): void {
    if (this.isBrowser()) {
      localStorage.setItem(KEYS.ASSIGNMENTS, JSON.stringify(data));
    }
  }

  // Status History
  getStatusHistory(): DriverStatusHistory[] {
    if (!this.isBrowser()) return initialStatusHistory;
    try {
      const stored = localStorage.getItem(KEYS.STATUS_HISTORY);
      if (!stored) {
        this.saveStatusHistory(initialStatusHistory);
        return initialStatusHistory;
      }
      return JSON.parse(stored);
    } catch {
      return initialStatusHistory;
    }
  }

  saveStatusHistory(data: DriverStatusHistory[]): void {
    if (this.isBrowser()) {
      localStorage.setItem(KEYS.STATUS_HISTORY, JSON.stringify(data));
    }
  }

  // Vehicle Documents
  getVehicleDocs(): VehicleDocument[] {
    if (!this.isBrowser()) return initialVehicleDocuments;
    try {
      const stored = localStorage.getItem(KEYS.VEHICLE_DOCS);
      if (!stored) {
        this.saveVehicleDocs(initialVehicleDocuments);
        return initialVehicleDocuments;
      }
      return JSON.parse(stored);
    } catch {
      return initialVehicleDocuments;
    }
  }

  saveVehicleDocs(data: VehicleDocument[]): void {
    if (this.isBrowser()) {
      localStorage.setItem(KEYS.VEHICLE_DOCS, JSON.stringify(data));
    }
  }

  // Driver Documents
  getDriverDocs(): DriverDocument[] {
    if (!this.isBrowser()) return initialDriverDocuments;
    try {
      const stored = localStorage.getItem(KEYS.DRIVER_DOCS);
      if (!stored) {
        this.saveDriverDocs(initialDriverDocuments);
        return initialDriverDocuments;
      }
      return JSON.parse(stored);
    } catch {
      return initialDriverDocuments;
    }
  }

  saveDriverDocs(data: DriverDocument[]): void {
    if (this.isBrowser()) {
      localStorage.setItem(KEYS.DRIVER_DOCS, JSON.stringify(data));
    }
  }

  // Activities
  getActivities(): ActivityEvent[] {
    if (!this.isBrowser()) return initialActivities;
    try {
      const stored = localStorage.getItem(KEYS.ACTIVITIES);
      if (!stored) {
        this.saveActivities(initialActivities);
        return initialActivities;
      }
      return JSON.parse(stored);
    } catch {
      return initialActivities;
    }
  }

  saveActivities(data: ActivityEvent[]): void {
    if (this.isBrowser()) {
      localStorage.setItem(KEYS.ACTIVITIES, JSON.stringify(data));
    }
  }

  // Reset to original seed data
  resetAllData(): void {
    if (this.isBrowser()) {
      localStorage.setItem(KEYS.VEHICLES, JSON.stringify(initialVehicles));
      localStorage.setItem(KEYS.DRIVERS, JSON.stringify(initialDrivers));
      localStorage.setItem(KEYS.ASSIGNMENTS, JSON.stringify(initialAssignments));
      localStorage.setItem(KEYS.STATUS_HISTORY, JSON.stringify(initialStatusHistory));
      localStorage.setItem(KEYS.VEHICLE_DOCS, JSON.stringify(initialVehicleDocuments));
      localStorage.setItem(KEYS.DRIVER_DOCS, JSON.stringify(initialDriverDocuments));
      localStorage.setItem(KEYS.ACTIVITIES, JSON.stringify(initialActivities));
      // Dispatch an event so listening views immediately refresh
      window.dispatchEvent(new Event("kot_data_reset"));
    }
  }
}

export const storageManager = new StorageManager();
