export type DriverStatus = 
  | "Active"
  | "On Leave"
  | "Suspended"
  | "Resigned"
  | "Terminated"
  | "Inactive";

export type LanguageProficiency = "None" | "Basic" | "Good" | "Fluent";

export interface DriverLanguage {
  language: string;
  proficiency: LanguageProficiency;
}

export interface DriverExperience {
  id: string;
  companyName: string;
  dateFrom?: string;
  dateTo?: string;
  jobTitle?: string;
  vehicleType?: string;
  yearsExperience?: number;
  remarks?: string;
}

export interface DriverReference {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  relation?: string;
}

export interface DriverStatusHistory {
  id: string;
  driverId: string;
  status: DriverStatus;
  effectiveFrom: string;
  effectiveTo?: string;
  reason?: string;
  remarks?: string;
  createdAt: string;
  createdBy: string;
}

export interface Driver {
  id: string;
  driverCode: string;
  pkCode?: string;
  inductionDate: string;

  name: string;
  fatherName?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  address?: string;
  maritalStatus?: string;
  bloodGroup?: string;
  mobileNumber?: string;
  education?: string;
  photoUrl?: string;

  // CNIC Information
  cnicNumber?: string;
  cnicIssueDate?: string;
  cnicExpiryDate?: string;
  cnicVerified?: boolean;

  // Driving License
  licenseNumber?: string;
  licenseType?: string;
  licenseIssueDate?: string;
  licenseExpiryDate?: string;
  licenseOnlineVerified?: boolean;
  drivingSince?: string;

  currentStatus: DriverStatus;

  languages: DriverLanguage[];
  experience: DriverExperience[];
  references: DriverReference[];

  createdAt: string;
  updatedAt: string;
}

export type CreateDriverInput = Omit<Driver, "id" | "createdAt" | "updatedAt">;
export type UpdateDriverInput = Partial<CreateDriverInput>;

export interface ChangeDriverStatusInput {
  driverId: string;
  newStatus: DriverStatus;
  effectiveFrom: string;
  effectiveTo?: string;
  reason: string;
  remarks?: string;
  endActiveAssignment?: boolean;
  createdBy?: string;
}
