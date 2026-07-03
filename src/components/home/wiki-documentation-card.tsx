import { Skeleton } from "@mui/material";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { articleAtom, draftArticleAtom } from "src/atoms/article";
import { errorAtom } from "src/atoms/error";
import { usersAtom } from "src/atoms/user";
import type { ArticleMetadata } from "src/generated/homeLambdasClient";
import { useLambdasApi } from "src/hooks/use-api";
import useUserRole from "src/hooks/use-user-role";
import strings from "src/localization/strings";
import HomepageCard, { type CardProps } from "../generics/homepageCard";
import renderCardContent from "./renderWikiDocCard";

/**
 * Card component for displaying last read, created or updated article for Wiki Documentation.
 */
const WikiDocumentationCard = ({ hidden, onToggleHidden, editmode }: CardProps) => {
  const { adminMode } = useUserRole();
  const setError = useSetAtom(errorAtom);
  const draftArticles = useAtomValue(draftArticleAtom);
  const normalArticles = useAtomValue(articleAtom);
  const setDraftArticles = useSetAtom(draftArticleAtom);
  const setNormalArticles = useSetAtom(articleAtom);
  const articlesAtom = adminMode ? draftArticles : normalArticles;
  const setArticlesAtom = adminMode ? setDraftArticles : setNormalArticles;
  const { articleApi } = useLambdasApi();
  const users = useAtomValue(usersAtom);
  const [loading, setLoading] = useState(false);
  const [lastUpdatedArticles, setLastUpdatedArticles] = useState<ArticleMetadata[]>([]);
  const path = adminMode ? "/admin/wiki-documentation" : "/wiki-documentation";

  /**
   * Fetches the last updated article from the API.
   * Sets the article in the global state and handles loading and errors.
   */
  useEffect(() => {
    if (!articlesAtom) getLastUpdatedArticle();
    else setLastUpdatedArticles(articlesAtom);
  }, []);
  /**
   * Retrieves the list of articles from the API.
   * Sets the first article as the last updated article.
   * Updates the articles atom with the fetched articles.
   */
  const getLastUpdatedArticle = async () => {
    setLoading(true);
    try {
      const fetchedArticles = await articleApi.getArticles(adminMode ? { draft: true } : {});
      setLastUpdatedArticles(fetchedArticles.slice(0, 2));
      setArticlesAtom(fetchedArticles.slice(0, 2));
    } catch (error: any) {
      const errorMessage = await error.response.json();
      setError(`${strings.error.fetchFailedWikiArticles}: ${errorMessage.message}`);
    }
    setLoading(false);
  };

  return (
    <HomepageCard
      title={strings.wikiDocumentation.cardTitle}
      content={loading ? <Skeleton /> : renderCardContent(lastUpdatedArticles, users, loading)}
      path={path}
      hidden={hidden}
      onToggleHidden={onToggleHidden}
      editmode={editmode}
    />
  );
};
export default WikiDocumentationCard;
