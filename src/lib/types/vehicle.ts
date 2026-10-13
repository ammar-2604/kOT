export type VehicleStatus = "Active" | "Inactive" | "Under Maintenance" | "Retired";

export type VehicleType = 
  | "Oil Tanker"
  | "Prime Mover"
  | "Rigid Tanker"
  | "Trailer"
  | "Bowser";

export interface TankCompartment {
  id: string;
  compartmentNumber: number;
  productType: "PMG" | "HSD" | "Other";
  capacityLiters: number;
  dip?: string;
  referenceDip?: string;
}

export interface Vehicle {
  id: string;
  vehicleNumber: string;
  status: VehicleStatus;

  chassisNumber?: string;
  engineNumber?: string;

  make?: string;
  model?: string;
  vehicleType?: VehicleType | string;

  manufacturingYear?: number;
  inductionYear?: number;

  colorBranding?: string;
  oem?: string;
  primeMoverType?: string;

  // Technical fields
  bowserQuantity?: number;
  bowserNumber?: string;
  bowserInductionYear?: number;

  hosePower?: string;
  chamberDetail?: string;
  driveAxle?: string;
  suspensionType?: string;
  brakeType?: string;

  bottomLoading?: boolean;
  trailerWheel?: string;
  spareTyreIncluded?: boolean;
  materialTrailer?: string;

  obcTracker?: boolean;
  mdvr?: boolean;

  primeMoverWeight?: number;
  bowserWeight?: number;
  oilSum?: string;

  // Capacity / Weight
  capacityKL?: number;
  grossVehicleWeight?: number;
  productWeight?: number;
  grossCargoWeight?: number;

  compartments: TankCompartment[];

  notes?: string;

  createdAt: string;
  updatedAt: string;
}

export type CreateVehicleInput = Omit<Vehicle, "id" | "createdAt" | "updatedAt">;
export type UpdateVehicleInput = Partial<CreateVehicleInput>;
