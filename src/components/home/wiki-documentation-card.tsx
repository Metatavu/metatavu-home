import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import { Box, Card, Grid, Skeleton, Typography } from "@mui/material";
import { useAtomValue, useSetAtom } from "jotai";
import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { articleAtom, draftArticleAtom } from "src/atoms/article";
import { errorAtom } from "src/atoms/error";
import { usersAtom } from "src/atoms/user";
import type { ArticleMetadata } from "src/generated/homeLambdasClient";
import { useLambdasApi } from "src/hooks/use-api";
import useUserRole from "src/hooks/use-user-role";
import strings from "src/localization/strings";
import { formatDate } from "src/utils/time-utils";
import { getLastActivityString } from "src/utils/wiki-utils";

/**
 * Card component for displaying last read, created or updated article for Wiki Documentation.
 */
const WikiDocumentationCard = () => {
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
  const [lastUpdatedArticle, setLastUpdatedArticle] = useState<ArticleMetadata>();

  /**
   * Fetches the last updated article from the API.
   * Sets the article in the global state and handles loading and errors.
   */
  useEffect(() => {
    if (!articlesAtom) getLastUpdatedArticle();
    else setLastUpdatedArticle(articlesAtom[0]);
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
      setLastUpdatedArticle(fetchedArticles[0]);
      setArticlesAtom(fetchedArticles);
    } catch (error: any) {
      const message = (await error.response.json()).message;
      setError(message);
    }
    setLoading(false);
  };
  /**
   * Renders the card content for the last updated article.
   * Displays the article title, last activity, and cover image.
   */
  const renderCardContent = () => {
    if (!lastUpdatedArticle?.lastUpdatedAt) return;
    const lastActivityData = getLastActivityString(lastUpdatedArticle, users);

    return (
      <>
        <Grid container>
          <Grid style={{ marginBottom: 1 }} item xs={1}>
            <DescriptionOutlinedIcon style={{ marginTop: 1 }} />
          </Grid>
          <Grid item xs={11}>
            {loading ? (
              <Skeleton />
            ) : (
              <Typography variant="body1" sx={{ paddingTop: "2px" }}>
                {strings.formatString(
                  "{0} {1}",
                  lastActivityData.action,
                  strings.wikiDocumentation.article
                )}
              </Typography>
            )}
          </Grid>
        </Grid>
        <Grid container spacing={1} sx={{ marginTop: 1 }}>
          <Grid item xs={6} sm={12} md={5} lg={4} marginBottom={{ sm: 2, md: 0 }}>
            <Box
              component="img"
              sx={{
                width: {
                  lg: "150px",
                  md: "125px",
                  sm: "100%",
                  xs: "125px"
                },
                height: {
                  lg: "120px",
                  md: "100px",
                  sm: "100%",
                  xs: "100px"
                },
                borderRadius: "20px",
                marginRight: "10px",
                objectFit: "cover",
                overflow: "hidden"
              }}
              alt="alternative text"
              src={lastUpdatedArticle.coverImage}
            />
          </Grid>
          <Grid item xs={6} sm={12} md={7} lg={8}>
            <Typography
              variant="h6"
              sx={{
                lineHeight: "1.2",
                marginBottom: "10px",
                fontSize: {
                  lg: "24px",
                  md: "20px",
                  sm: "24px",
                  xs: "20px"
                },
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "normal",
                wordBreak: "break-word",
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: { md: 2, sm: 2, xs: 2 }
              }}
            >
              {lastUpdatedArticle.title}
            </Typography>
            <Typography variant="body1">
              {strings.formatString(
                "{0} {1}",
                lastActivityData.action,
                formatDate(DateTime.fromJSDate(lastUpdatedArticle.lastUpdatedAt || new Date()))
              )}
            </Typography>
            <Typography variant="body1">
              {strings.formatString("by {0}", lastActivityData.user ?? "")}
            </Typography>
          </Grid>
        </Grid>
      </>
    );
  };
  /**
   * Renders the admin card content.
   * Displays the number of pending articles or a message when there are none.
   */
  const renderAdminCardContent = () => (
    <Grid container>
      <Grid style={{ marginBottom: 1 }} item xs={1}>
        <DescriptionOutlinedIcon style={{ marginTop: 1 }} />
      </Grid>
      {loading ? (
        <Skeleton />
      ) : (
        <Grid item xs={11}>
          <Typography variant="body1" sx={{ paddingTop: "2px" }}>
            {articlesAtom?.length === 0
              ? strings.wikiDocumentation.noPendingArticles
              : strings.formatString(
                  strings.wikiDocumentation.pendingArticles,
                  articlesAtom?.length ?? 0
                )}
          </Typography>
        </Grid>
      )}
    </Grid>
  );

  return (
    <Link
      to={adminMode ? "/admin/wiki-documentation" : "/wiki-documentation"}
      style={{ textDecoration: "none" }}
    >
      <Card>
        <Box sx={{ padding: 2 }}>
          <Typography variant="h6" fontWeight={"bold"} style={{ marginTop: 6, marginBottom: 3 }}>
            {strings.wikiDocumentation.cardTitle}
          </Typography>
          {loading && <Skeleton />}
          {!loading && adminMode && renderAdminCardContent()}
          {!loading && !adminMode && renderCardContent()}
        </Box>
      </Card>
    </Link>
  );
};
export default WikiDocumentationCard;
