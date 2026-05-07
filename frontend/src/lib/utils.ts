import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatYear(dateStr: string): string {
  if (!dateStr) return "N/A";
  return new Date(dateStr).getFullYear().toString();
}

export function tmdbImageUrl(path: string | null, size = "w500"): string {
  if (!path) return "/placeholder-poster.jpg";
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export function formatRuntime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
