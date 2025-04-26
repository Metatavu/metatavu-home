import { 
  Grid, 
  Typography, 
  Card, 
  CardContent, 
  Skeleton, 
  Box
} from "@mui/material";
import strings from "src/localization/strings";
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { errorAtom } from "src/atoms/error";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import UserRoleUtils from "src/utils/user-role-utils";
import type {  ArticleMetadata } from "src/generated/homeLambdasClient";
import { useLambdasApi } from "src/hooks/use-api";
import { articleAtom, draftArticleAtom } from "src/atoms/article";

/**
 * Component for displaying last read, created or updated article for Wiki Documentation.
 */
const WikiDocumentationCard = () => { 
  const setError = useSetAtom(errorAtom);
  const adminMode = UserRoleUtils.adminMode();
  const articlesAtom = adminMode ? useAtomValue(draftArticleAtom) : useAtomValue(articleAtom);
  const setArticlesAtom = adminMode ? useSetAtom(draftArticleAtom) : useSetAtom(articleAtom);
  const { articleApi } = useLambdasApi();
  const [loading, setLoading] = useState(false);
  const [lastUpdatedArticle, setLastUpdatedArticle] = useState<ArticleMetadata>(articlesAtom[0]);

  /**
   * Fetch last updated article.
   */
  useEffect(() => {
    if (articlesAtom.length === 0)
      getLastUpdatedArticle();
  }, []);

  const getLastUpdatedArticle = async () => {
    setLoading(true);
    try {
      const fetchedArticles = await articleApi.getArticles(adminMode ? {draft: true} : {});
      setLastUpdatedArticle(fetchedArticles[0]);
      setArticlesAtom(fetchedArticles);
    } catch (error) {
      setError(`${error}`);
    }
    setLoading(false);
  };

  const renderCardContent = () => {
    if (!lastUpdatedArticle || !lastUpdatedArticle.lastUpdatedAt) return;
    const {
      lastUpdatedAt,
      createdAt,
      lastReadAt
    } = lastUpdatedArticle;

    let lastActivityType = "";

    if (lastUpdatedAt.getTime() === createdAt?.getTime())
      lastActivityType = strings.wikiDocumentation.created

    else if (lastUpdatedAt.getTime() === lastReadAt?.getTime()) 
      lastActivityType = strings.wikiDocumentation.read;

    else lastActivityType = strings.wikiDocumentation.updated;

    return (
      <>
        <Grid container>
          <Grid style={{ marginBottom: 1 }} item xs={1}>
            <DescriptionOutlinedIcon style={{ marginTop: 1}} />
          </Grid>
          <Grid item xs={11}>
            {loading ? <Skeleton /> 
              : <Typography variant="body1" sx={{paddingTop: "2px"}}>
                {strings.formatString(strings.wikiDocumentation.lastActivityArticle, lastActivityType)}
              </Typography>
            }
          </Grid>
        </Grid>
        <Card style={{ marginTop: "15px", padding: "15px", borderRadius: "20px", backgroundColor: "#fafafa"}}>
          <Grid container spacing={1}>
            <Grid item xs={6} sm={12} md={5} lg={4} marginBottom={{sm: "15px", md: "0"}}>
              <Box
                component="img"
                sx={{
                  width: {
                    lg:"150px", 
                    md: "125px", 
                    sm: "100%", 
                    xs: "125px"
                  },
                  height: {
                    lg:"120px", 
                    md: "100px", 
                    sm: "100%", 
                    xs:"100px"
                  },
                  borderRadius: "20px",
                  marginRight: "10px",
                  objectFit: "cover",
                  overflow: "hidden"
                }}
                alt="The house from the offer."
                src={lastUpdatedArticle.coverImage}
              />
            </Grid>
            <Grid item xs={6}  sm={12} md={7} lg={8}>
              <Typography variant="h6" sx={{
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
                WebkitLineClamp: {md: 2, sm: 2, xs: 2}
              }}>
                {lastUpdatedArticle.title}
              </Typography>
              <Typography variant="body1">
                {strings.formatString(
                  "{0} {1}",
                  lastActivityType[0].toUpperCase() + lastActivityType.slice(1), 
                  lastUpdatedAt.toLocaleDateString())
                }
              </Typography>
              <Typography variant="body1">
                {strings.formatString(
                  "By {0}",
                  "Viille Juatialainen")
                }
              </Typography>
            </Grid>
          </Grid>
        </Card>
      </>
    )
  }

  return (
    <Link
      to={adminMode ? "/admin/wiki-documentation" : "/wiki-documentation"}
      style={{ textDecoration: "none" }}
    >
      <Card
        sx={{
          "&:hover": {
            background: "#efefef"
          }
        }}
      >
        <CardContent>
          <Typography variant="h6" fontWeight={"bold"} style={{ marginTop: 6, marginBottom: 3 }}>
            {strings.wikiDocumentation.cardTitle}
          </Typography>
          {loading ? <Skeleton/> : renderCardContent()}
        </CardContent>
      </Card>
    </Link>
  );
};

export default WikiDocumentationCard;
