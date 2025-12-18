import type { ArticleMetadata, User } from "src/generated/homeLambdasClient";
import strings from "src/localization/strings";
import { getFullUserName } from "./user-name-utils";
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
