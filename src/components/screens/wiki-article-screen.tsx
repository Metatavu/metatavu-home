import { Card, CircularProgress, Grid } from "@mui/material";
import { useEffect, useState } from "react";
import type { Article } from "src/generated/homeLambdasClient";
import strings from "src/localization/strings";
import { useSetAtom } from "jotai";
import { useParams } from "react-router";
import { errorAtom } from "src/atoms/error";
import { useLambdasApi } from "src/hooks/use-api";
import ReactMarkdown from "react-markdown";
import ActionButton from "../wiki-documentation/action-button";
import CreateOrEditArticleForm from "../wiki-documentation/create-article-form";
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import { Link } from "react-router-dom";
import UserRoleUtils from "src/utils/user-role-utils";

/**
 * Manager page for user to interact with the questionnaire; fill and edit
 *
 * @param props component properties
 */
const ArticleScreen = () => {
  const adminMode = UserRoleUtils.adminMode();
  const setError = useSetAtom(errorAtom);
  const { '*': path } = useParams();
  const { articleApi } = useLambdasApi();
  const [article, setArticle] = useState<Article>();
  const [loading, setLoading] = useState(true);
  const [formOpen,  setFormOpen] = useState(false);

  useEffect(() => {
    fetchArticle();
  }, [path]);

  const closeForm = () => setFormOpen(false);

  const fetchArticle = async() => {
    if (path) {
      setLoading(true);
      try {
        const article = await articleApi.getArticle({ path });
        setArticle(article);
      } catch(error: any) {
        const message = (await error.response.json()).message;
        setError(message);
      }
    }
    setTimeout(()=> {
      setLoading(false);
    }, 1000)
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
              <ReactMarkdown>
                {article?.content || ""}
              </ReactMarkdown>
            </Card>
          </>}
        </>
      }
    </>
  );
};

export default ArticleScreen;
