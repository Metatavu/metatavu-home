import type { ArticleMetadata } from "src/generated/homeLambdasClient";
import strings from "src/localization/strings";

export const getLastActivityString = (article: ArticleMetadata) => {
  const {
    lastUpdatedAt,
    createdAt,
    lastReadAt
  } = article;

  if (lastUpdatedAt?.getTime() === createdAt?.getTime())
    return { 
      action: strings.wikiDocumentation.lastCreated, 
      user: article.createdBy 
    }

  if (lastUpdatedAt?.getTime() === lastReadAt?.getTime()) 
    return { 
      action: strings.wikiDocumentation.lastRead, 
      user: article.readBy ? article.readBy[article.readBy.length-1] : ""
    }

  return { 
    action: strings.wikiDocumentation.lastUpdated, 
    user: article.lastUpdatedBy 
  };
}