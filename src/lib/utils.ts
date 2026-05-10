import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(iso?: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export function formatRelativeDate(iso?: string): string {
  if (!iso) return "—";
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / 86_400_000);
    if (days === 0) return "today";
    if (days === 1) return "yesterday";
    if (days < 30) return `${days}d ago`;
    if (days < 365) return `${Math.floor(days / 30)}mo ago`;
    return `${Math.floor(days / 365)}yr ago`;
  } catch {
    return iso;
  }
}

export function shortenUuid(uuid?: string): string {
  if (!uuid) return "—";
  return uuid.slice(0, 8) + "…";
}

/** Compute days_left client-side from expiry ISO string (fallback). */
export function computeDaysLeft(expiry?: string): number | undefined {
  if (!expiry) return undefined;
  const ms = new Date(expiry).getTime() - Date.now();
  return Math.floor(ms / 86_400_000);
}
