import config from "src/app/config";
import type { ArticleApi } from "src/generated/homeLambdasClient";

const s3ImageFolder = config.s3.articleImagesFolder;
const s3ArticleBucket = config.s3.articleBucket;

/**
 * Type for response data from API that could be in various formats
 */
interface ApiResponse {
  data?: string[];
  files?: string[];
  [key: string]: string[] | undefined;
}

/**
 * Type guard to check if value is an array of strings
 */
const isStringArray = (value: unknown): value is string[] => {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
};

/**
 * Convert S3 URI to HTTPS URL
 * @param fileName - The file name to construct URL for
 * @returns HTTPS URL for the S3 file
 */
export const getHttpsUrlFromS3 = (fileName: string): string => {
  const s3BucketUrl = config.s3.articleBucket;

  if (s3BucketUrl.startsWith("s3://")) {
    const withoutProtocol = s3BucketUrl.replace("s3://", "");
    const parts = withoutProtocol.split("/");
    const bucketName = parts[0];
    const pathPrefix = parts.slice(1).join("/");
    const region = "eu-north-1";
    const cleanPath = pathPrefix.endsWith("/") ? pathPrefix.slice(0, -1) : pathPrefix;
    return `https://${bucketName}.s3.${region}.amazonaws.com/${cleanPath}/${fileName}`;
  } else if (s3BucketUrl.startsWith("https://")) {
    const cleanUrl = s3BucketUrl.endsWith("/") ? s3BucketUrl.slice(0, -1) : s3BucketUrl;
    return `${cleanUrl}/${fileName}`;
  }
  return `${s3BucketUrl}/${fileName}`;
};

/**
 * List media files from S3
 * @param articleApi - The article API instance
 * @param prefix - Optional prefix to filter files
 * @returns Array of file metadata
 */
export const listMediaFiles = async (
  articleApi: ArticleApi,
  prefix?: string
): Promise<string[]> => {
  const response = await articleApi.listMediaFilesRaw({ prefix });
  const rawResponse = (await response.raw.json()) as ApiResponse | string[];

  // Handle different response formats
  let files: string[];
  if (Array.isArray(rawResponse)) {
    files = rawResponse;
  } else if (rawResponse?.data && Array.isArray(rawResponse.data)) {
    files = rawResponse.data;
  } else if (rawResponse?.files && Array.isArray(rawResponse.files)) {
    files = rawResponse.files;
  } else if (rawResponse && typeof rawResponse === "object") {
    const keys = Object.keys(rawResponse);
    const firstValue = rawResponse[keys[0]];
    files = isStringArray(firstValue) ? firstValue : [];
  } else {
    files = [];
  }
  return files;
};

export const uploadFile = async (
  file: File,
  articleApi: ArticleApi
): Promise<string | undefined> => {
  if (!file) return;

  const folder = s3ImageFolder.replace(/^\//g, "").replace(/\/$/g, "");
  const filePath = folder ? `${folder}/${file.name}` : file.name;
  const presignedUrlResponse = await articleApi.uploadFileForArticle({
    fileMetadata: {
      path: filePath,
      contentType: file.type
    }
  });

  const uploadResponse = await fetch(presignedUrlResponse.data, {
    method: "PUT",
    headers: {
      "Content-Type": file.type
    },
    body: file
  });

  if (!uploadResponse.ok) {
    throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
  }

  const bucket = s3ArticleBucket.replace(/^\//g, "").replace(/\/$/g, "");
  return `${bucket}/${filePath}`;
};
