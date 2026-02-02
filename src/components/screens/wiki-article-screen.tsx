import { Alert, Box, Card, CircularProgress, Grid, Snackbar, Typography } from "@mui/material";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useNavigate, useParams } from "react-router";
import { articleAtom, draftArticleAtom } from "src/atoms/article";
import { userProfileAtom } from "src/atoms/auth";
import { errorAtom } from "src/atoms/error";
import { snackbarAtom } from "src/atoms/snackbar";
import { usersAtom } from "src/atoms/user";
import type { Article, ArticleMetadata, User } from "src/generated/homeLambdasClient";
import { useLambdasApi } from "src/hooks/use-api";
import useUserRole from "src/hooks/use-user-role";
import strings from "src/localization/strings";
import { formatDate } from "src/utils/time-utils";
import { getImageContainerStyle, getImageMaxWidth } from "src/utils/image-style-utils";
import type { ImageAlignment, ImageSize } from "src/utils/image-style-utils";
import BackButton from "../generics/back-button";
import ActionButton from "../wiki-documentation/action-button";
import ArticleListItem from "../wiki-documentation/article-list-item";
import CreateOrEditArticleForm from "../wiki-documentation/create-article-form";
import "../wiki-documentation/rich-text-editor/editor.css";

/**
 * Article screen component displaying the article content.
 */
const ArticleScreen = () => {
  const { adminMode } = useUserRole();
  const setError = useSetAtom(errorAtom);
  const { "*": path } = useParams();
  const { articleApi } = useLambdasApi();
  const [article, setArticle] = useState<Article>();
  const [connectedArticles, setConnectedArticles] = useState<ArticleMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const users = useAtomValue(usersAtom);
  const userProfile = useAtomValue(userProfileAtom);
  const loggedInUser = users.find((users: User) => users.id === userProfile?.id);
  const [snackbar, setSnackbar] = useAtom(snackbarAtom);
  const setArticlesAtom = useSetAtom(articleAtom);
  const setDraftArticlesAtom = useSetAtom(draftArticleAtom);
  const navigate = useNavigate();

  useEffect(() => {
    fetchArticle();
  }, [path]);

  const handleClose = () => {
    setFormOpen(false);
  };
  /**
   * Loads article and connected articles by path, updates state,
   * records article read, handles errors, and manages loading state.
   */
  const fetchArticle = async () => {
    if (path) {
      setLoading(true);
      try {
        const article = await articleApi.getArticleByPath({ path });
        if (!adminMode) {
          const connectedArticles = await articleApi.getArticles({
            pathPrefix: article.path.slice(0, article.path.lastIndexOf("/"))
          });
          const filteredConnectedArticles = connectedArticles.filter(
            (connectedArticle) => article.id !== connectedArticle.id
          );
          setConnectedArticles(filteredConnectedArticles);
        }
        setArticle(article);
        recordReadArticle(article);
      } catch (error: any) {
        const message = (await error.response.json()).message;
        setError(message);
      }
    }
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };
  /**
   * Records that the currently logged-in user has read the specified article.
   *
   * If the article or its ID is missing, or if the user has already been recorded as having read it,
   * the function exits early without making an API call.
   *
   * @param {Article | undefined} article - The article object to mark as read.
   *
   * @returns {Promise<void>} A promise that resolves once the read record is processed.
   */
  const recordReadArticle = async (article?: Article) => {
    const userId = loggedInUser?.id;
    if (!article || !article.id || !userId) return;
    if (article.readBy?.includes(userId)) return;
    try {
      await articleApi.readArticle({ id: article.id, readArticleRequest: { user: userId } });
      setArticle((prev) => (prev ? { ...prev, readBy: [...(prev.readBy || []), userId] } : prev));
    } catch (error: any) {
      const message = (await error.response.json()).message;
      setError(message);
    }
  };

  /**
   * Approves the current article by marking it as not a draft and updating the last editor.
   *
   * This function will:
   * - Update the article via the API.
   * - Update the relevant article lists (`draftArticlesAtom` and `articlesAtom`) based on admin mode.
   * - Update the UI state with the updated article and show a success snackbar.
   * - Handle API errors and set the error message in state.
   *
   */
  const handleApprove = async () => {
    if (!article?.id) return;

    const updatedArticle: Article = {
      ...article,
      draft: false,
      lastUpdatedBy: loggedInUser?.id || ""
    };
    try {
      const response = await articleApi.updateArticle({ article: updatedArticle, id: article.id });
      if (!adminMode) {
        setDraftArticlesAtom((articles) => [response, ...(articles || [])]);
        setArticlesAtom((articles) =>
          (articles || []).filter((article) => article.id !== response.id)
        );
      } else {
        if (article.draft)
          setDraftArticlesAtom((articles) =>
            (articles || []).filter((article) => article.id !== response.id)
          );
        else
          setArticlesAtom((articles) =>
            (articles || []).filter((article) => article.id !== response.id)
          );
        setArticlesAtom((articles) => [response, ...(articles || [])]);
        if (setArticle) setArticle(updatedArticle);
      }
      setSnackbar({
        open: true,
        message: strings.snackbar.articleApproved,
        severity: "success"
      });
      if (adminMode) {
        navigate("/admin/wiki-documentation");
      }
    } catch (error: any) {
      const message = (await error.response.json()).message;
      setError(message);
    }
  };

  return (
    <>
      {loading ? (
        <Card
          sx={{
            p: "25%",
            display: "flex",
            justifyContent: "center"
          }}
        >
          <CircularProgress sx={{ scale: "150%" }} />
        </Card>
      ) : (
        <>
          {" "}
          {formOpen ? (
            <CreateOrEditArticleForm
              handleClose={handleClose}
              action="edit"
              article={article}
              setArticle={setArticle}
              adminMode={adminMode}
            />
          ) : (
            <>
              {adminMode && (
                <Grid container spacing={1.5} sx={{ marginBottom: 3, marginTop: 0.5 }}>
                  <Grid item xs={6}>
                    <ActionButton onClick={() => setFormOpen(true)}>
                      {strings.wikiDocumentation.edit}
                    </ActionButton>
                  </Grid>
                  <Grid item xs={6}>
                    <ActionButton onClick={handleApprove}>
                      {strings.wikiDocumentation.approve}
                    </ActionButton>
                  </Grid>
                </Grid>
              )}
              <Card sx={{ padding: 3, paddingTop: 0, marginBottom: 3 }}>
                {/* Title */}
                {article?.title && (
                  <Typography variant="h4" sx={{ marginBottom: 2 }}>
                    {article.title}
                  </Typography>
                )}

                {/* Main Image */}
                {article?.coverImage && (
                  <Box
                    component="img"
                    src={article.coverImage}
                    alt={article.title || strings.wikiDocumentation.imagePreview}
                    sx={{
                      width: "100%",
                      maxHeight: 400,
                      objectFit: "cover",
                      borderRadius: 2,
                      mb: 2
                    }}
                  />
                )}
                {/* Created / Updated Dates */}
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {article?.createdAt &&
                    `Created: ${formatDate(DateTime.fromJSDate(article.createdAt))}`}
                  {article?.lastUpdatedAt &&
                    ` | Updated: ${formatDate(DateTime.fromJSDate(article.lastUpdatedAt))}`}
                </Typography>
                {/* Tags */}
                {article?.tags && article.tags.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    {article.tags.map((tag: string, index: number) => (
                      <Box
                        key={`tag-${index}-${tag}`}
                        component="span"
                        sx={{
                          display: "inline-block",
                          backgroundColor: "#e0e0e0",
                          borderRadius: "20px",
                          px: 2,
                          py: 0.5,
                          mr: 1,
                          mb: 1,
                          fontSize: "0.875rem"
                        }}
                      >
                        {tag}
                      </Box>
                    ))}
                  </Box>
                )}

                {/* Markdown Content */}
                <ReactMarkdown
                  components={{
                    img: ({ node, ...props }) => {
                      const altText = props.alt || "";
                      const parts = altText.split("|");
                      const alignment = (parts.length >= 3 ? (parts.pop()?.trim() || "center") : "center") as ImageAlignment;
                      const size = (parts.length >= 2 ? (parts.pop()?.trim() || "medium") : "medium") as ImageSize;
                      const alt = parts.join("|").trim() || "";

                      const maxWidth = getImageMaxWidth(size);
                      const containerStyle = getImageContainerStyle(alignment, maxWidth);

                      return (
                        <div style={containerStyle}>
                          <img
                            {...props}
                            alt={alt}
                            style={{
                              display: "block",
                              width: "100%",
                              borderRadius: "15px"
                            }}
                          />
                        </div>
                      );
                    },
                    code: ({ node, inline, ...props }) => (
                      <code {...props} className={!inline ? "editor-code" : ""} />
                    ),
                    blockquote: ({ node, ...props }) => (
                      <blockquote {...props} className="editor-quote" />
                    )
                  }}
                >
                  {article?.content || ""}
                </ReactMarkdown>
              </Card>
              {!adminMode && connectedArticles.length !== 0 && (
                <Box sx={{ marginBottom: 3 }}>
                  <Typography variant="h5" sx={{ marginLeft: 3, marginBottom: 3 }}>
                    {strings.wikiDocumentation.connectedArticles}
                  </Typography>
                  {connectedArticles.map((article) => (
                    <Box key={`connected-article-${article.id}`} sx={{ marginBottom: 4 }}>
                      <ArticleListItem article={article} />
                    </Box>
                  ))}
                </Box>
              )}
              <Grid container spacing={1.5} sx={{ marginBottom: 3 }}>
                <Grid item xs={12}>
                  <BackButton styles={{ padding: "6px" }} />
                </Grid>
              </Grid>
            </>
          )}
        </>
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        sx={{
          "& .MuiSnackbarContent-root": {
            minWidth: 400,
            minHeight: 100,
            fontSize: "1.5rem",
            borderRadius: "16px"
          }
        }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity="success"
          sx={{
            width: "100%",
            fontSize: "1.5rem",
            py: 3,
            px: 4,
            borderRadius: "14px"
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ArticleScreen;
