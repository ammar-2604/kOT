import { DocumentComplianceStatus } from "../types";

export interface ExpiryCalculation {
  status: DocumentComplianceStatus;
  daysRemaining: number;
  label: string;
}

export function getExpiryStatus(expiryDate?: string | null): ExpiryCalculation {
  if (!expiryDate) {
    return {
      status: "Not Available",
      daysRemaining: 0,
      label: "No Expiry Date",
    };
  }

  const expiry = new Date(expiryDate);
  if (isNaN(expiry.getTime())) {
    return {
      status: "Not Available",
      daysRemaining: 0,
      label: "Invalid Date",
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0) {
    return {
      status: "Expired",
      daysRemaining,
      label: `Expired (${Math.abs(daysRemaining)}d ago)`,
    };
  }

  if (daysRemaining <= 30) {
    return {
      status: "Expiring Soon",
      daysRemaining,
      label: `Expires in ${daysRemaining}d`,
    };
  }

  return {
    status: "Valid",
    daysRemaining,
    label: `${daysRemaining}d remaining`,
  };
}
