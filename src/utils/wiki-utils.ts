import type { ArticleMetadata, User } from "src/generated/homeLambdasClient";
import strings from "src/localization/strings";
import { getFullUserName } from "./user-name-utils";

/**
 * Sorts articles by date in descending order (newest first).
 *
 * @param {ArticleMetadata[]} articles - Array of articles to sort.
 * @returns {ArticleMetadata[]} Sorted array of articles.
 */
export const sortArticlesByDate = (articles: ArticleMetadata[]): ArticleMetadata[] => {
  return [...articles].sort((a, b) => {
    const dateA = new Date(a.lastUpdatedAt || a.createdAt || 0).getTime();
    const dateB = new Date(b.lastUpdatedAt || b.createdAt || 0).getTime();
    return dateB - dateA;
  });
};

/**
 * Gets the appropriate articles to filter based on admin mode and display option.
 *
 * @param {boolean} adminMode - Whether the user is in admin mode.
 * @param {string} displayOption - The current display option ("all", "draft", or "approved").
 * @param {ArticleMetadata[]} articles - Array of approved articles.
 * @param {ArticleMetadata[]} draftArticles - Array of draft articles.
 * @returns {ArticleMetadata[]} Filtered array of articles based on the display option.
 */
export const getArticlesToFilter = (
  adminMode: boolean,
  displayOption: string,
  articles: ArticleMetadata[],
  draftArticles: ArticleMetadata[]
): ArticleMetadata[] => {
  if (!adminMode) {
    return articles ?? [];
  }

  if (displayOption === "all") {
    return [...(articles ?? []), ...(draftArticles ?? [])];
  }

  if (displayOption === "draft") {
    return draftArticles ?? [];
  }

  if (displayOption === "approved") {
    return (articles ?? []).filter((article) => !article.draft);
  }

  return articles ?? [];
};

/**
 * Returns an object describing the most recent activity on an article.
 *
 * Determines whether the last activity was creation, last read, or last update,
 * based on timestamps, and returns a corresponding action string and user.
 *
 * @param {ArticleMetadata} article - The article metadata object containing timestamps and user IDs.
 * @param {User[]} users - Array of all users for resolving user IDs to display names.
 * @returns {{ action: string; user: string }} An object with the action description and the user responsible.
 */
export const getLastActivityString = (article: ArticleMetadata, users: User[]) => {
  const { lastUpdatedAt, createdAt, lastReadAt } = article;

  const getUserName = (userId?: string) => {
    const user = users.find((u) => u.id === userId);
    return getFullUserName(user);
  };

  if (lastReadAt && (!lastUpdatedAt || lastReadAt > lastUpdatedAt)) {
    const lastReader = article.readBy?.[article.readBy.length - 1];
    return {
      action: strings.wikiDocumentation.lastRead,
      user: getUserName(lastReader)
    };
  }

  if (lastUpdatedAt && createdAt && lastUpdatedAt > createdAt) {
    return {
      action: strings.wikiDocumentation.lastUpdated,
      user: getUserName(article.lastUpdatedBy)
    };
  }

  return {
    action: strings.wikiDocumentation.created,
    user: getUserName(article.createdBy)
  };
};
