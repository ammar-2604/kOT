export function formatDate(dateString?: string | null): string {
  if (!dateString) return "—";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }); // e.g. "14 Oct 2026"
  } catch {
    return dateString;
  }
}

export function calculateAge(dateOfBirth?: string): number | null {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
}

export function calculateDuration(fromStr: string, toStr?: string | null): string {
  if (!fromStr) return "—";
  const from = new Date(fromStr);
  const to = toStr ? new Date(toStr) : new Date();
  if (isNaN(from.getTime()) || isNaN(to.getTime())) return "—";

  const diffMs = to.getTime() - from.getTime();
  if (diffMs < 0) return "0 days";

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (!toStr) {
    if (diffDays < 30) return `${diffDays} days (Current)`;
    const months = Math.floor(diffDays / 30);
    return `${months} mo (${diffDays} d) Current`;
  }

  if (diffDays < 30) {
    return `${diffDays} days`;
  }
  const months = Math.floor(diffDays / 30);
  const remDays = diffDays % 30;
  return `${diffDays} days (${months}m ${remDays}d)`;
}

export function getTodayISODate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
