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

/**
 * Imports a PDF playbook into the system by uploading it to S3 and then registering it via the article API.
 *
 * @param file - The PDF file to import.
 * @param title - The title to assign to the imported document. If not provided, the file name (without .pdf) will be used.
 * @param articleApi - The article API instance used for uploading and importing the document.
 * @returns An object containing the path of the imported article.
 * @throws Error if the file is not provided, is not a PDF, if the upload fails, or if the import does not return an article path.
 */
export const importPlaybook = async (
  file: File,
  title: string,
  articleApi: ArticleApi
): Promise<{ articlePath: string }> => {
  if (!file) throw new Error("File is required");
  if (file.type !== "application/pdf") throw new Error("Only PDF files are supported");
  const documentTitle = title?.trim() || file.name.replace(/\.pdf$/i, "");
  const filePath = `${Date.now()}-${file.name}`;
  const { data: presignedUrl } = await articleApi.uploadFileForArticle({
    fileMetadata: { path: filePath, contentType: "application/pdf" }
  });

  const uploadResponse = await fetch(presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": "application/pdf" },
    body: file
  });

  if (!uploadResponse.ok) {
    throw new Error(`PDF upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
  }

  const result = await articleApi.importDocument({
    documentImportRequest: {
      path: filePath,
      documentTitle
    }
  });

  const articlePath = result.basePath;
  if (!articlePath) throw new Error("Import succeeded but no article path returned");

  return { articlePath };
};
