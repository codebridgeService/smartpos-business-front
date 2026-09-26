/**
 * Client-side image processing and WebP conversion utility
 */

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.0 to 1.0
}

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

export const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

/**
 * Validate an avatar file before processing
 */
export function validateAvatarFile(file: File): ImageValidationResult {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: "Invalid file format. Please upload a JPEG, PNG, or WebP image.",
    };
  }

  if (file.size > MAX_AVATAR_SIZE_BYTES) {
    return {
      valid: false,
      error: "Image exceeds 5MB maximum limit. Please choose a smaller file.",
    };
  }

  return { valid: true };
}

/**
 * Format bytes into human-readable string (KB, MB)
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Converts any compatible image file into an optimized WebP Blob
 */
export function convertImageToWebP(
  file: File,
  options: ImageProcessingOptions = {}
): Promise<{ blob: Blob; width: number; height: number; previewUrl: string }> {
  const { maxWidth = 1000, maxHeight = 1000, quality = 0.85 } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const img = new Image();

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio constrained scaling
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Unable to obtain 2D canvas rendering context"));
          return;
        }

        // Draw image into canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("WebP conversion failed"));
              return;
            }
            const previewUrl = URL.createObjectURL(blob);
            resolve({ blob, width, height, previewUrl });
          },
          "image/webp",
          quality
        );
      };

      img.onerror = () => {
        reject(new Error("Failed to load image file into memory"));
      };

      img.src = readerEvent.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error("Failed to read image file"));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Normalizes and resolves an avatar image URL from user profile data.
 * Prioritizes `avatar_url`, handles relative storage paths, fixes potential localhost
 * mismatches with remote API endpoints, and returns null if no valid image is present.
 */
export function getAvatarUrl(
  avatarUrl?: string | null,
  avatar?: string | null
): string | null {
  // Prefer avatar_url if provided and valid, otherwise fallback to avatar
  let raw =
    avatarUrl && typeof avatarUrl === "string" && avatarUrl.trim()
      ? avatarUrl.trim()
      : avatar && typeof avatar === "string" && avatar.trim()
      ? avatar.trim()
      : null;

  if (!raw) return null;

  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://smartpos-api.servicefixit.me/api/v1";
  const backendOrigin = apiBase.replace(/\/api\/v1\/?$/, "");

  // If URL points to localhost while backend origin is remote (e.g. backend APP_URL misconfiguration)
  if (
    backendOrigin &&
    !backendOrigin.includes("localhost") &&
    !backendOrigin.includes("127.0.0.1")
  ) {
    if (
      raw.startsWith("http://localhost") ||
      raw.startsWith("http://127.0.0.1") ||
      raw.startsWith("https://localhost")
    ) {
      try {
        const parsed = new URL(raw);
        raw = `${backendOrigin}${parsed.pathname}${parsed.search}`;
      } catch {
        // Keep raw if invalid URL
      }
    }
  }

  // If already an absolute URL or blob/data URI
  if (
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("data:") ||
    raw.startsWith("blob:")
  ) {
    return raw;
  }

  // Handle relative paths
  if (raw.startsWith("/")) {
    return backendOrigin ? `${backendOrigin}${raw}` : raw;
  }

  if (raw.startsWith("storage/")) {
    return backendOrigin ? `${backendOrigin}/${raw}` : `/${raw}`;
  }

  return backendOrigin ? `${backendOrigin}/storage/${raw}` : `/storage/${raw}`;
}

