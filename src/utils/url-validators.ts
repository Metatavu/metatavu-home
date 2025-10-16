/**
 * Checks whether a string is a valid HTTP or HTTPS URL.
 * @param url - The string to validate as a URL.
 * @returns `true` if the string is a valid URL starting with "http://" or "https://".
 */
export const isValidHttpUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

/**
 * Checks whether a URL points to a valid image resource.
 * Attempts a HEAD request. If the HEAD request fails (CORS or blocked),
 * falls back to using `<img>` element to confirm URL loads as an image.
 *
 * @param url - The URL string to validate as an image.
 * @returns A Promise that resolves to `true` if the URL points to an image, otherwise `false`.
 */
export const isValidImageUrl = async (url: string): Promise<boolean> => {
  try {
    const headRes = await fetch(url, { method: "HEAD" });
    if (headRes.ok) {
      const type = headRes.headers.get("Content-Type");
      if (type?.startsWith("image/")) return true;
    }
  } catch {
    // Intentionally ignored — fallback below handles validation
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};
