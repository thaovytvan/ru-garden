/**
 * Utility to get the full URL for an image in the Admin portal.
 * Handles both full URLs (Cloudinary) and relative paths (Legacy/Seed data).
 */
export const getImageUrl = (path?: string | null): string => {
  if (!path) {
    return "https://via.placeholder.com/150?text=No+Image";
  }

  // 1. Check if it's already a full URL (Cloudinary or External)
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // 2. Handle legacy relative paths (seed data /images/products/...)
  // These are served by the backend's /uploads static handler.
  const backendUrl = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:4000";
  const uploadsUrl = `${backendUrl}/uploads`;
  
  // Ensure we don't double slash
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  
  return `${uploadsUrl}${normalizedPath}`;
};
