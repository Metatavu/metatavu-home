import { Box, Card, CircularProgress, Grid, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import type { Article, ArticleMetadata, User } from "src/generated/homeLambdasClient";
import strings from "src/localization/strings";
import { useAtomValue, useSetAtom } from "jotai";
import { useParams } from "react-router";
import { errorAtom } from "src/atoms/error";
import { useLambdasApi } from "src/hooks/use-api";
import ReactMarkdown from "react-markdown";
import ActionButton from "../wiki-documentation/action-button";
import CreateOrEditArticleForm from "../wiki-documentation/create-article-form";
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import { Link } from "react-router-dom";
import UserRoleUtils from "src/utils/user-role-utils";
import { usersAtom } from "src/atoms/user";
import { userProfileAtom } from "src/atoms/auth";
import "../wiki-documentation/rich-text-editor/editor.css"
import ArticleListItem from "../wiki-documentation/article-list-item";

/**
 * Article screen component displaying the article content.
 */
const ArticleScreen = () => {
  const adminMode = UserRoleUtils.adminMode();
  const setError = useSetAtom(errorAtom);
  const { '*': path } = useParams();
  const { articleApi } = useLambdasApi();
  const [article, setArticle] = useState<Article>();
  const [connectedArticles, setConnectedArticles] = useState<ArticleMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [formOpen,  setFormOpen] = useState(false);
  const users = useAtomValue(usersAtom);
  const userProfile = useAtomValue(userProfileAtom);
  const loggedInUser = users.find(
    (users: User) => users.id === userProfile?.id
  );

  useEffect(() => {
    fetchArticle();
  }, [path]);

  const closeForm = () => setFormOpen(false);
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
          const connectedArticles = await articleApi.getArticles(
            {pathPrefix: article.path
              .slice(0, article.path.lastIndexOf("/"))
            }
          );
          const filteredConnectedArticles = connectedArticles
            .filter(connectedArticle => article.id !== connectedArticle.id)
          setConnectedArticles(filteredConnectedArticles);
        }
        setArticle(article);
        recordReadArticle(article);
      } catch(error: any) {
        const message = (await error.response.json()).message;
        setError(message);
      }
    }
    setTimeout(()=> {
      setLoading(false);
    }, 1000)
  }
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
    const user = `${loggedInUser?.firstName} ${loggedInUser?.lastName}`;
    if (!article || !article.id) return;
    if (article.readBy?.includes(user)) return;
    try {
      await articleApi.readArticle({id: article.id, readArticleRequest: {user: user}})
      setArticle(prev => prev ? { ...prev, readBy: [...(prev.readBy || []), user] } : prev);
    } catch(error: any) {
      const message = (await error.response.json()).message;
      setError(message);
    }
  }

  return (
    <> 
      {loading 
        ? <Card sx={{ 
            p: "25%", 
            display: "flex", 
            justifyContent: "center" 
          }}>
            <CircularProgress sx={{ scale: "150%" }} />
          </Card>
        : <> {formOpen 
          ? <CreateOrEditArticleForm 
              setFormOpen={setFormOpen} 
              action="edit" 
              article={article}
              setArticle={setArticle}
              adminMode={adminMode}
            />
          : <>
            <Grid
              container 
              spacing={1.5} 
              sx={{ marginBottom: 3, marginTop: 0.5 }}
            >
              <Grid item xs={6}>
              <Link to={adminMode ? "/admin/wiki-documentation" : "/wiki-documentation"}>
                <ActionButton onClick={closeForm}>
                  <>
                    <KeyboardReturnIcon sx={{marginRight: 1}}/>
                    {strings.wikiDocumentation.back} 
                  </>
                </ActionButton>
              </Link>
              </Grid>
              <Grid item xs={6}>
              <ActionButton onClick={() => setFormOpen(true)}>
                {strings.wikiDocumentation.edit}
              </ActionButton>
              </Grid>
            </Grid>
            <Card sx={{padding: 3, paddingTop: 0, marginBottom: 3}}>
              <ReactMarkdown 
                components={{
                  img: ({node, ...props}) => (
                    <img 
                      {...props} 
                      alt={props.alt} 
                      style={{ 
                        display: "block", 
                        width: "100%",
                        borderRadius: "15px"
                      }}
                    />
                  ),
                  code: ({node, inline, ...props}) => (
                    <code 
                      {...props}
                      className={!inline ? "editor-code" : ""}
                    />
                  ),
                  blockquote: ({node, ...props}) => (
                    <blockquote  
                      {...props}
                      className={"editor-quote"}
                    />
                  )
                }}
              >
                {article?.content || ""}
              </ReactMarkdown>
            </Card>
            {!adminMode &&
              <>
                {connectedArticles.length !== 0 && 
                  <Box sx={{ marginBottom: 3 }}>
                    <Typography variant="h5" sx={{ marginLeft: 3, marginBottom: 3}}>
                      {strings.wikiDocumentation.connectedArticles}
                    </Typography>
                    {connectedArticles.map((article) => (
                      <Box sx={{ marginBottom: 4 }}>
                        <ArticleListItem article={article} key={`connected-article-${article.id}`}/>
                      </Box>
                    ))}
                  </Box>
                }
              </>
            }
          </>}
        </>
      }
    </>
  );
};

export default ArticleScreen;
