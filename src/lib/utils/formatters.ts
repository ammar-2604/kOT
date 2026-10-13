export function formatCNIC(cnic?: string | null): string {
  if (!cnic) return "—";
  // Remove all non-digits
  const clean = cnic.replace(/\D/g, "");
  if (clean.length === 13) {
    return `${clean.slice(0, 5)}-${clean.slice(5, 12)}-${clean.slice(12)}`;
  }
  return cnic;
}

export function formatCapacityKL(kl?: number | null): string {
  if (kl === undefined || kl === null) return "—";
  return `${kl.toLocaleString()} KL`;
}

export function formatWeightKg(kg?: number | null): string {
  if (kg === undefined || kg === null) return "—";
  return `${kg.toLocaleString()} kg`;
}

export function formatLiters(liters?: number | null): string {
  if (liters === undefined || liters === null) return "—";
  return `${liters.toLocaleString()} L`;
}

export function formatMobile(mobile?: string | null): string {
  if (!mobile) return "—";
  return mobile;
}
