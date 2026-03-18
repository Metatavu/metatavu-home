import config from "src/app/config";
import type { ArticleApi } from "src/generated/homeLambdasClient";

const s3ImageFolder = config.s3.articleImagesFolder;

/**
 * Convert S3 file name to HTTPS URL
 * @param fileName - The file name to construct URL for
 * @returns HTTPS URL for the S3 file
 */
export const getHttpsUrlFromS3 = (fileName: string): string => {
  const base = config.s3.articleBucket.replace(/\/$/, "");
  return `${base}/${fileName}`;
};

/**
 * List media files from S3
 * @param articleApi - The article API instance
 * @param prefix - Optional prefix to filter files
 * @returns Array of file paths
 */
export const listMediaFiles = async (
  articleApi: ArticleApi,
  prefix?: string
): Promise<string[]> => {
  const response = await articleApi.listMediaFilesRaw({ prefix });
  const body = (await response.raw.json()) as { data: string[] };
  return body.data ?? [];
};

/**
 * Uploads a file to S3 via a presigned URL and returns the public URL of the uploaded file.
 *
 * @param file - The file to upload.
 * @param articleApi - The article API instance used to obtain the presigned upload URL.
 * @returns The public HTTPS URL of the uploaded file.
 * @throws Error if the upload request fails.
 */
export const uploadFile = async (file: File, articleApi: ArticleApi): Promise<string> => {
  const folder = s3ImageFolder.replace(/^\/|\/$/g, "");
  const filePath = folder ? `${folder}/${file.name}` : file.name;

  const { data: presignedUrl } = await articleApi.uploadFileForArticle({
    fileMetadata: { path: filePath, contentType: file.type }
  });

  const uploadResponse = await fetch(presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file
  });

  if (!uploadResponse.ok) {
    throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
  }

  return getHttpsUrlFromS3(filePath);
};
