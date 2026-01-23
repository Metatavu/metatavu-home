/**
 * Converts a base64 string to a Blob
 *
 * @param base64 The base64 string
 * @param mime The MIME type of the resulting Blob
 * @returns The resulting Blob
 */
export const base64ToBlob = (base64: string, mime: string): Blob => {
  const byteCharacters = atob(base64); // decode base64
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mime });
};
