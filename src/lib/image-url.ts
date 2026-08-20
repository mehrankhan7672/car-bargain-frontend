const API_URL = import.meta.env.IMG_URL || "http://localhost:5000";

/**
 * Car/logo images are stored in the DB as relative web paths, e.g.
 * "/uploads/cars/car-123.jpg" (see CarController.js). The browser needs the
 * full backend URL to actually load them. This also safely passes through
 * any value that's already a full URL (e.g. legacy data, or a future move
 * to cloud storage), so it never double-prefixes.
 */
export function getImageUrl(path: string | undefined | null): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
