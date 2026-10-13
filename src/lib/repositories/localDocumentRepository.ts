import { DocumentRepository } from "./interfaces";
import {
  VehicleDocument,
  DriverDocument,
  ExpiringDocumentSummary,
} from "../types";
import { storageManager } from "./storageManager";
import { getExpiryStatus } from "../utils/expiry";

export class LocalDocumentRepository implements DocumentRepository {
  async getVehicleDocuments(vehicleId: string): Promise<VehicleDocument[]> {
    const list = storageManager.getVehicleDocs();
    return list.filter((d) => d.vehicleId === vehicleId);
  }

  async getDriverDocuments(driverId: string): Promise<DriverDocument[]> {
    const list = storageManager.getDriverDocs();
    return list.filter((d) => d.driverId === driverId);
  }

  async addVehicleDocument(doc: Omit<VehicleDocument, "id">): Promise<VehicleDocument> {
    const list = storageManager.getVehicleDocs();
    const id = `vdoc-${Date.now()}`;
    const newDoc: VehicleDocument = {
      ...doc,
      id,
    };
    list.unshift(newDoc);
    storageManager.saveVehicleDocs(list);
    return newDoc;
  }

  async addDriverDocument(doc: Omit<DriverDocument, "id">): Promise<DriverDocument> {
    const list = storageManager.getDriverDocs();
    const id = `ddoc-${Date.now()}`;
    const newDoc: DriverDocument = {
      ...doc,
      id,
    };
    list.unshift(newDoc);
    storageManager.saveDriverDocs(list);
    return newDoc;
  }

  async getAllVehicleDocuments(): Promise<VehicleDocument[]> {
    return storageManager.getVehicleDocs();
  }

  async getAllDriverDocuments(): Promise<DriverDocument[]> {
    return storageManager.getDriverDocs();
  }

  async getExpiringDocuments(): Promise<ExpiringDocumentSummary[]> {
    const vehicles = storageManager.getVehicles();
    const drivers = storageManager.getDrivers();
    const vDocs = storageManager.getVehicleDocs();
    const dDocs = storageManager.getDriverDocs();

    const vehicleMap = new Map(vehicles.map((v) => [v.id, v.vehicleNumber]));
    const driverMap = new Map(drivers.map((d) => [d.id, `${d.name} (${d.driverCode})`]));

    const summaries: ExpiringDocumentSummary[] = [];

    // Vehicle docs
    for (const doc of vDocs) {
      if (doc.expiryDate) {
        const exp = getExpiryStatus(doc.expiryDate);
        // Include expired or expiring soon (<= 30 days)
        if (exp.daysRemaining <= 30) {
          summaries.push({
            id: doc.id,
            entityType: "vehicle",
            entityId: doc.vehicleId,
            entityIdentifier: vehicleMap.get(doc.vehicleId) || "Unknown Vehicle",
            documentType: doc.documentType,
            expiryDate: doc.expiryDate,
            daysRemaining: exp.daysRemaining,
            status: exp.status,
          });
        }
      }
    }

    // Driver docs
    for (const doc of dDocs) {
      if (doc.expiryDate) {
        const exp = getExpiryStatus(doc.expiryDate);
        if (exp.daysRemaining <= 30) {
          summaries.push({
            id: doc.id,
            entityType: "driver",
            entityId: doc.driverId,
            entityIdentifier: driverMap.get(doc.driverId) || "Unknown Driver",
            documentType: doc.documentType,
            expiryDate: doc.expiryDate,
            daysRemaining: exp.daysRemaining,
            status: exp.status,
          });
        }
      }
    }

    // Driver licenses also count as expiring document check!
    for (const driver of drivers) {
      if (driver.licenseExpiryDate) {
        const exp = getExpiryStatus(driver.licenseExpiryDate);
        if (exp.daysRemaining <= 30) {
          summaries.push({
            id: `lic-${driver.id}`,
            entityType: "driver",
            entityId: driver.id,
            entityIdentifier: `${driver.name} (${driver.driverCode})`,
            documentType: `Driving License (${driver.licenseType || "HTV"})`,
            expiryDate: driver.licenseExpiryDate,
            daysRemaining: exp.daysRemaining,
            status: exp.status,
          });
        }
      }
    }

    // Sort by daysRemaining ascending (most urgent first)
    return summaries.sort((a, b) => a.daysRemaining - b.daysRemaining);
  }
}

export const documentRepository = new LocalDocumentRepository();
