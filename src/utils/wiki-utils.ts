import type { ArticleMetadata } from "src/generated/homeLambdasClient";
import strings from "src/localization/strings";
/**
 * Returns an object describing the most recent activity on an article.
 * 
 * Determines whether the last activity was creation, last read, or last update,
 * based on timestamps, and returns a corresponding action string and user.
 * 
 * @param {ArticleMetadata} article - The article metadata object containing timestamps and user info.
 * @returns {{ action: string; user: string }} An object with the action description and the user responsible.
 */
export const getLastActivityString = (article: ArticleMetadata) => {
  const {
    lastUpdatedAt,
    createdAt,
    lastReadAt
  } = article;

  if (lastUpdatedAt?.getTime() === createdAt?.getTime())
    return { 
      action: strings.wikiDocumentation.created, 
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