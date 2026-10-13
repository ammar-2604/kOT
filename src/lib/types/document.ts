export type DocumentComplianceStatus = "Valid" | "Expiring Soon" | "Expired" | "Not Available";

export interface VehicleDocument {
  id: string;
  vehicleId: string;
  documentType: string;
  documentNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  issuingAuthority?: string;
  fileName?: string;
  status: DocumentComplianceStatus;
  remarks?: string;
}

export interface DriverDocument {
  id: string;
  driverId: string;
  documentType: string;
  documentNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  testDate?: string;
  result?: string;
  verificationStatus?: string;
  issuingAuthority?: string;
  fileName?: string;
  status: DocumentComplianceStatus;
  remarks?: string;
}

export interface ExpiringDocumentSummary {
  id: string;
  entityType: "vehicle" | "driver";
  entityId: string;
  entityIdentifier: string; // e.g. "KOT-101" or "Ahmed Khan (DR-0001)"
  documentType: string;
  expiryDate: string;
  daysRemaining: number;
  status: DocumentComplianceStatus;
}
