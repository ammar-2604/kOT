import {
  vehicleRepository,
  driverRepository,
  assignmentRepository,
  documentRepository,
  activityRepository,
} from "../repositories";
import {
  Vehicle,
  CreateVehicleInput,
  UpdateVehicleInput,
  Driver,
  CreateDriverInput,
  UpdateDriverInput,
  ChangeDriverStatusInput,
  VehicleDriverAssignment,
  CreateAssignmentInput,
  EndAssignmentInput,
  ChangeDriverInput,
  DriverPosition,
  VehicleDocument,
  DriverDocument,
  ExpiringDocumentSummary,
  ActivityEvent,
  DriverStatusHistory,
} from "../types";

export interface DashboardMetrics {
  totalVehicles: number;
  activeVehicles: number;
  totalDrivers: number;
  activeDrivers: number;
  driversOnLeave: number;
  suspendedDrivers: number;
  resignedDrivers: number;
  unassignedVehicles: number;
  fullyMannedVehicles: number;
  partiallyMannedVehicles: number;
  unassignedDrivers: number;
  activeAssignmentsCount: number;
}

export interface ActiveAssignmentView {
  assignment: VehicleDriverAssignment;
  vehicle: Vehicle;
  driver: Driver;
}

export interface VehicleDriversView {
  driver1: {
    driver: Driver;
    assignment: VehicleDriverAssignment;
  } | null;
  driver2: {
    driver: Driver;
    assignment: VehicleDriverAssignment;
  } | null;
}

export interface VehicleDetailView {
  vehicle: Vehicle;
  drivers: VehicleDriversView;
  documents: VehicleDocument[];
  driverHistory: Array<{
    assignment: VehicleDriverAssignment;
    driver: Driver | null;
  }>;
  activities: ActivityEvent[];
}

export interface DriverDetailView {
  driver: Driver;
  currentAssignment: VehicleDriverAssignment | null;
  currentVehicle: Vehicle | null;
  driverPosition: DriverPosition | null;
  documents: DriverDocument[];
  statusHistory: DriverStatusHistory[];
  vehicleHistory: Array<{
    assignment: VehicleDriverAssignment;
    vehicle: Vehicle | null;
  }>;
  activities: ActivityEvent[];
}

export interface VehicleWithDriversSummary {
  vehicle: Vehicle;
  driver1: Driver | null;
  driver2: Driver | null;
  driver1Assignment?: VehicleDriverAssignment | null;
  driver2Assignment?: VehicleDriverAssignment | null;
}

export interface DriverWithVehicleSummary {
  driver: Driver;
  currentVehicle: Vehicle | null;
  driverPosition: DriverPosition | null;
  currentAssignment?: VehicleDriverAssignment | null;
}

export class FleetService {
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const vehicles = await vehicleRepository.getAll();
    const drivers = await driverRepository.getAll();
    const activeAssignments = await assignmentRepository.getActive();

    const activeVehicles = vehicles.filter((v) => v.status === "Active");
    const activeDrivers = drivers.filter((d) => d.currentStatus === "Active");
    const driversOnLeave = drivers.filter((d) => d.currentStatus === "On Leave");
    const suspendedDrivers = drivers.filter((d) => d.currentStatus === "Suspended");
    const resignedDrivers = drivers.filter((d) => d.currentStatus === "Resigned" || d.currentStatus === "Terminated");

    // Count how many active drivers each vehicle has
    const vehicleDriverCount = new Map<string, number>();
    const assignedDriverIds = new Set<string>();

    for (const asgn of activeAssignments) {
      vehicleDriverCount.set(asgn.vehicleId, (vehicleDriverCount.get(asgn.vehicleId) || 0) + 1);
      assignedDriverIds.add(asgn.driverId);
    }

    let fullyManned = 0;
    let partiallyManned = 0;
    let unassigned = 0;

    for (const v of vehicles) {
      const count = vehicleDriverCount.get(v.id) || 0;
      if (count >= 2) {
        fullyManned++;
      } else if (count === 1) {
        partiallyManned++;
      } else {
        unassigned++;
      }
    }

    const unassignedDrivers = activeDrivers.filter((d) => !assignedDriverIds.has(d.id)).length;

    return {
      totalVehicles: vehicles.length,
      activeVehicles: activeVehicles.length,
      totalDrivers: drivers.length,
      activeDrivers: activeDrivers.length,
      driversOnLeave: driversOnLeave.length,
      suspendedDrivers: suspendedDrivers.length,
      resignedDrivers: resignedDrivers.length,
      unassignedVehicles: unassigned,
      fullyMannedVehicles: fullyManned,
      partiallyMannedVehicles: partiallyManned,
      unassignedDrivers,
      activeAssignmentsCount: activeAssignments.length,
    };
  }

  async getActiveAssignmentsWithDetails(): Promise<ActiveAssignmentView[]> {
    const activeAssignments = await assignmentRepository.getActive();
    const vehicles = await vehicleRepository.getAll();
    const drivers = await driverRepository.getAll();

    const vehicleMap = new Map(vehicles.map((v) => [v.id, v]));
    const driverMap = new Map(drivers.map((d) => [d.id, d]));

    return activeAssignments
      .map((asgn) => {
        const vehicle = vehicleMap.get(asgn.vehicleId);
        const driver = driverMap.get(asgn.driverId);
        if (!vehicle || !driver) return null;
        return {
          assignment: asgn,
          vehicle,
          driver,
        };
      })
      .filter((item): item is ActiveAssignmentView => item !== null);
  }

  async getExpiringDocuments(): Promise<ExpiringDocumentSummary[]> {
    return documentRepository.getExpiringDocuments();
  }

  async getAllVehiclesWithDriverInfo(): Promise<VehicleWithDriversSummary[]> {
    const vehicles = await vehicleRepository.getAll();
    const activeAssignments = await assignmentRepository.getActive();
    const drivers = await driverRepository.getAll();

    const driverMap = new Map(drivers.map((d) => [d.id, d]));
    const vehicleDriver1Map = new Map<string, { driver: Driver; assignment: VehicleDriverAssignment }>();
    const vehicleDriver2Map = new Map<string, { driver: Driver; assignment: VehicleDriverAssignment }>();

    for (const asgn of activeAssignments) {
      const driver = driverMap.get(asgn.driverId);
      if (driver) {
        if (asgn.driverPosition === "Driver 1") {
          vehicleDriver1Map.set(asgn.vehicleId, { driver, assignment: asgn });
        } else if (asgn.driverPosition === "Driver 2") {
          vehicleDriver2Map.set(asgn.vehicleId, { driver, assignment: asgn });
        }
      }
    }

    return vehicles.map((v) => {
      const d1 = vehicleDriver1Map.get(v.id);
      const d2 = vehicleDriver2Map.get(v.id);
      return {
        vehicle: v,
        driver1: d1 ? d1.driver : null,
        driver2: d2 ? d2.driver : null,
        driver1Assignment: d1 ? d1.assignment : null,
        driver2Assignment: d2 ? d2.assignment : null,
      };
    });
  }

  async getAllDriversWithVehicleInfo(): Promise<DriverWithVehicleSummary[]> {
    const drivers = await driverRepository.getAll();
    const activeAssignments = await assignmentRepository.getActive();
    const vehicles = await vehicleRepository.getAll();

    const vehicleMap = new Map(vehicles.map((v) => [v.id, v]));
    const driverAssignmentMap = new Map<string, VehicleDriverAssignment>();

    for (const asgn of activeAssignments) {
      driverAssignmentMap.set(asgn.driverId, asgn);
    }

    return drivers.map((d) => {
      const asgn = driverAssignmentMap.get(d.id);
      const vehicle = asgn ? vehicleMap.get(asgn.vehicleId) || null : null;
      return {
        driver: d,
        currentVehicle: vehicle,
        driverPosition: asgn ? asgn.driverPosition : null,
        currentAssignment: asgn || null,
      };
    });
  }

  async getVehicleDetails(vehicleId: string): Promise<VehicleDetailView | null> {
    const vehicle = await vehicleRepository.getById(vehicleId);
    if (!vehicle) return null;

    const activeAssignments = await assignmentRepository.getActiveByVehicleId(vehicleId);
    const drivers = await driverRepository.getAll();
    const driverMap = new Map(drivers.map((d) => [d.id, d]));

    let driver1: { driver: Driver; assignment: VehicleDriverAssignment } | null = null;
    let driver2: { driver: Driver; assignment: VehicleDriverAssignment } | null = null;

    for (const asgn of activeAssignments) {
      const drv = driverMap.get(asgn.driverId);
      if (drv) {
        if (asgn.driverPosition === "Driver 1") {
          driver1 = { driver: drv, assignment: asgn };
        } else if (asgn.driverPosition === "Driver 2") {
          driver2 = { driver: drv, assignment: asgn };
        }
      }
    }

    const documents = await documentRepository.getVehicleDocuments(vehicleId);
    const allVehicleAssignments = await assignmentRepository.getByVehicleId(vehicleId);

    const driverHistory = allVehicleAssignments.map((asgn) => ({
      assignment: asgn,
      driver: driverMap.get(asgn.driverId) || null,
    }));

    const activities = await activityRepository.getByEntity("vehicle", vehicleId);

    return {
      vehicle,
      drivers: {
        driver1,
        driver2,
      },
      documents,
      driverHistory,
      activities,
    };
  }

  async getDriverDetails(driverId: string): Promise<DriverDetailView | null> {
    const driver = await driverRepository.getById(driverId);
    if (!driver) return null;

    const currentAssignment = await assignmentRepository.getActiveByDriverId(driverId);
    let currentVehicle: Vehicle | null = null;
    if (currentAssignment) {
      currentVehicle = await vehicleRepository.getById(currentAssignment.vehicleId);
    }

    const documents = await documentRepository.getDriverDocuments(driverId);
    const statusHistory = await driverRepository.getStatusHistory(driverId);
    const assignments = await assignmentRepository.getByDriverId(driverId);
    const vehicles = await vehicleRepository.getAll();
    const vehicleMap = new Map(vehicles.map((v) => [v.id, v]));

    const vehicleHistory = assignments.map((asgn) => ({
      assignment: asgn,
      vehicle: vehicleMap.get(asgn.vehicleId) || null,
    }));

    const activities = await activityRepository.getByEntity("driver", driverId);

    return {
      driver,
      currentAssignment,
      currentVehicle,
      driverPosition: currentAssignment ? currentAssignment.driverPosition : null,
      documents,
      statusHistory,
      vehicleHistory,
      activities,
    };
  }

  async assignDriver(input: CreateAssignmentInput): Promise<VehicleDriverAssignment> {
    const driver = await driverRepository.getById(input.driverId);
    if (!driver) {
      throw new Error("Selected driver not found.");
    }

    // Eligibility check
    if (driver.currentStatus !== "Active") {
      throw new Error(`Driver status is "${driver.currentStatus}". Only Active drivers can be assigned to a vehicle.`);
    }

    const vehicle = await vehicleRepository.getById(input.vehicleId);
    if (!vehicle) {
      throw new Error("Selected vehicle not found.");
    }

    const newAssignment = await assignmentRepository.create(input);

    // Record activity events
    const timestamp = new Date().toISOString();
    await activityRepository.add({
      entityType: "vehicle",
      entityId: input.vehicleId,
      title: `${input.driverPosition} Assigned`,
      description: `${driver.name} (${driver.driverCode}) assigned as ${input.driverPosition}.`,
      timestamp,
      actor: input.createdBy || "Operations Dispatcher",
    });

    await activityRepository.add({
      entityType: "driver",
      entityId: input.driverId,
      title: "Vehicle Assigned",
      description: `Assigned to ${vehicle.vehicleNumber} as ${input.driverPosition}.`,
      timestamp,
      actor: input.createdBy || "Operations Dispatcher",
    });

    return newAssignment;
  }

  async changeDriver(input: ChangeDriverInput): Promise<{ endedAssignment: VehicleDriverAssignment; newAssignment: VehicleDriverAssignment }> {
    const vehicle = await vehicleRepository.getById(input.vehicleId);
    if (!vehicle) throw new Error("Vehicle not found.");

    const newDriver = await driverRepository.getById(input.newDriverId);
    if (!newDriver) throw new Error("Replacement driver not found.");

    if (newDriver.currentStatus !== "Active") {
      throw new Error(`Replacement driver status is "${newDriver.currentStatus}". Only Active drivers can be assigned.`);
    }

    const res = await assignmentRepository.changeDriver(input);

    const oldDriver = await driverRepository.getById(res.endedAssignment.driverId);
    const timestamp = new Date().toISOString();

    await activityRepository.add({
      entityType: "vehicle",
      entityId: input.vehicleId,
      title: `${input.driverPosition} Changed`,
      description: `Replaced ${oldDriver?.name || "previous driver"} with ${newDriver.name} (${newDriver.driverCode}) as ${input.driverPosition}. Reason: ${input.endReason}.`,
      timestamp,
      actor: "Operations Manager",
    });

    if (oldDriver) {
      await activityRepository.add({
        entityType: "driver",
        entityId: oldDriver.id,
        title: "Assignment Ended",
        description: `Assignment on ${vehicle.vehicleNumber} as ${input.driverPosition} ended. Reason: ${input.endReason}.`,
        timestamp,
        actor: "Operations Manager",
      });
    }

    await activityRepository.add({
      entityType: "driver",
      entityId: newDriver.id,
      title: "Vehicle Assigned",
      description: `Assigned to ${vehicle.vehicleNumber} as ${input.driverPosition}.`,
      timestamp,
      actor: "Operations Manager",
    });

    return res;
  }

  async endAssignment(assignmentId: string, input: EndAssignmentInput): Promise<VehicleDriverAssignment> {
    const assignment = await assignmentRepository.endAssignment(assignmentId, input);
    const vehicle = await vehicleRepository.getById(assignment.vehicleId);
    const driver = await driverRepository.getById(assignment.driverId);
    const timestamp = new Date().toISOString();

    if (vehicle) {
      await activityRepository.add({
        entityType: "vehicle",
        entityId: vehicle.id,
        title: `${assignment.driverPosition} Assignment Ended`,
        description: `Assignment of ${driver?.name || "driver"} as ${assignment.driverPosition} ended. Reason: ${input.endReason}.`,
        timestamp,
        actor: "Operations Dispatcher",
      });
    }

    if (driver) {
      await activityRepository.add({
        entityType: "driver",
        entityId: driver.id,
        title: "Vehicle Assignment Ended",
        description: `Assignment on ${vehicle?.vehicleNumber || "vehicle"} as ${assignment.driverPosition} ended. Reason: ${input.endReason}.`,
        timestamp,
        actor: "Operations Dispatcher",
      });
    }

    return assignment;
  }

  async changeDriverStatus(input: ChangeDriverStatusInput): Promise<{ driver: Driver; history: DriverStatusHistory }> {
    const driver = await driverRepository.getById(input.driverId);
    if (!driver) throw new Error("Driver not found.");

    // Check if driver has active assignment
    const activeAssignment = await assignmentRepository.getActiveByDriverId(input.driverId);

    // If resigned or terminated, automatically end assignment.
    // If on leave or suspended and user requested/or system mandated, end assignment.
    const mustEndAssignment = 
      input.newStatus === "Resigned" ||
      input.newStatus === "Terminated" ||
      input.newStatus === "Inactive" ||
      input.endActiveAssignment === true;

    if (activeAssignment && mustEndAssignment) {
      await this.endAssignment(activeAssignment.id, {
        assignedTo: input.effectiveFrom,
        endReason: `Driver Status Changed to ${input.newStatus}: ${input.reason}`,
        remarks: input.remarks,
      });
    }

    const result = await driverRepository.changeStatus(input);
    const timestamp = new Date().toISOString();

    await activityRepository.add({
      entityType: "driver",
      entityId: input.driverId,
      title: `Status Changed to ${input.newStatus}`,
      description: `Reason: ${input.reason}. Remarks: ${input.remarks || "None"}`,
      timestamp,
      actor: input.createdBy || "Operations Manager",
    });

    return result;
  }

  async registerVehicle(input: CreateVehicleInput): Promise<Vehicle> {
    const existing = await vehicleRepository.getByNumber(input.vehicleNumber);
    if (existing) {
      throw new Error(`Vehicle number "${input.vehicleNumber}" already exists.`);
    }

    const vehicle = await vehicleRepository.create(input);
    const timestamp = new Date().toISOString();

    await activityRepository.add({
      entityType: "vehicle",
      entityId: vehicle.id,
      title: "Vehicle Registered",
      description: `New ${vehicle.vehicleType || "vehicle"} ${vehicle.vehicleNumber} registered to fleet.`,
      timestamp,
      actor: "Operations Admin",
    });

    return vehicle;
  }

  async updateVehicle(id: string, input: UpdateVehicleInput): Promise<Vehicle> {
    if (input.vehicleNumber) {
      const existing = await vehicleRepository.getByNumber(input.vehicleNumber);
      if (existing && existing.id !== id) {
        throw new Error(`Vehicle number "${input.vehicleNumber}" is already in use by another vehicle.`);
      }
    }

    const updated = await vehicleRepository.update(id, input);
    await activityRepository.add({
      entityType: "vehicle",
      entityId: id,
      title: "Vehicle Updated",
      description: `Vehicle specification / profile details updated.`,
      timestamp: new Date().toISOString(),
      actor: "Operations Admin",
    });

    return updated;
  }

  async registerDriver(input: CreateDriverInput): Promise<Driver> {
    const existing = await driverRepository.getByCode(input.driverCode);
    if (existing) {
      throw new Error(`Driver code "${input.driverCode}" is already in use.`);
    }

    const driver = await driverRepository.create(input);
    const timestamp = new Date().toISOString();

    await activityRepository.add({
      entityType: "driver",
      entityId: driver.id,
      title: "Driver Registered",
      description: `${driver.name} registered with code ${driver.driverCode}.`,
      timestamp,
      actor: "Fleet HR",
    });

    return driver;
  }

  async updateDriver(id: string, input: UpdateDriverInput): Promise<Driver> {
    if (input.driverCode) {
      const existing = await driverRepository.getByCode(input.driverCode);
      if (existing && existing.id !== id) {
        throw new Error(`Driver code "${input.driverCode}" is already in use.`);
      }
    }

    const updated = await driverRepository.update(id, input);
    await activityRepository.add({
      entityType: "driver",
      entityId: id,
      title: "Driver Profile Updated",
      description: `Driver personal / license information updated.`,
      timestamp: new Date().toISOString(),
      actor: "Fleet HR",
    });

    return updated;
  }

  async addVehicleDocument(doc: Omit<VehicleDocument, "id">): Promise<VehicleDocument> {
    return documentRepository.addVehicleDocument(doc);
  }

  async addDriverDocument(doc: Omit<DriverDocument, "id">): Promise<DriverDocument> {
    return documentRepository.addDriverDocument(doc);
  }
}

export const fleetService = new FleetService();
