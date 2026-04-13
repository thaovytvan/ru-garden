/**
 * Utility to get the full URL for an image.
 * If the path is relative and starts with /uploads, it prefixes it with the backend uploads URL.
 * If the path is already a full URL (http/https), it returns it as is.
 * If no path is provided, it returns a default placeholder.
 */
export const getImageUrl = (path?: string | null): string => {
  if (!path) {
    return "https://images.unsplash.com/photo-1545241047-6083a3684587?q=80&w=1587&auto=format&fit=crop";
  }

  // 1. Check if it's already a full URL (Cloudinary or External)
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // 2. Check if it's a local frontend asset (public folder)
  // These usually start with /images/ or /static/
  if (path.startsWith("/images/") || path.startsWith("/static/")) {
    return path;
  }

  // 3. Handle backend relative paths
  const uploadsUrl = process.env.NEXT_PUBLIC_UPLOADS_URL || "http://localhost:4000/uploads";
  
  // Ensure we don't double slash
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  
  // If the path already includes /uploads/, we should be careful not to duplicate it
  if (normalizedPath.startsWith("/uploads/")) {
    const fileName = normalizedPath.replace("/uploads/", "");
    return `${uploadsUrl}/${fileName}`;
  }

  return `${uploadsUrl}${normalizedPath}`;
};

/**
 * Validates if a string is a valid category.
 */
export const isValidCategory = (category: string): boolean => {
  return ["VAN_PHONG", "TRONG_NHA", "NGOAI_TROI", "SEN_DA_XUONG_RONG", "NHIET_DOI"].includes(category);
};
