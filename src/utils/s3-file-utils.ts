import config from "src/app/config";
import type { ArticleApi } from "src/generated/homeLambdasClient";

const s3ImageFolder = config.s3.articleImagesFolder;
const s3ArticleBucket = config.s3.articleBuket;

export const uploadFile = async (file: File, articleApi: ArticleApi) => {
  if (!file) return;

  const filePath = `${s3ImageFolder}/${file.name}`;

  const presignedUrlResponse = await articleApi.uploadFileForArticle({
    fileMetadata: {
      path: filePath,
      contentType: file.type
    }
  });

  const uploadResponse = await fetch(presignedUrlResponse.data, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file
  });

  if (uploadResponse.status === 200) {
    return `${s3ArticleBucket}/${s3ImageFolder}/${file.name}`;
  }
};
