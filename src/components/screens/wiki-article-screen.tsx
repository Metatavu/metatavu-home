import { Card, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import type { Article } from "src/generated/homeLambdasClient";
import strings from "src/localization/strings";

import { useSetAtom } from "jotai";
import { useParams } from "react-router";
import { errorAtom } from "src/atoms/error";
import { useLambdasApi } from "src/hooks/use-api";
import ReactMarkdown from "react-markdown";

/**
 *  Manager page for user to interact with the questionnaire; fill and edit
 *
 * @param props component properties
 */
const ArticleScreen = () => {
  const setError = useSetAtom(errorAtom);
  const { '*': path } = useParams();
  const { articleApi } = useLambdasApi();
  const [article, setArticle] = useState<Article>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchArticle()
  }, [path]);

  // if (loading) {
  //   return (
  //     <CircularProgress
  //       size={50}
  //       style={{
  //         position: "absolute",
  //         top: "50%",
  //         left: "50%",
  //         transform: "translate(-50%, -50%)"
  //       }}
  //     />
  //   );
  // }

  const fetchArticle = async() => {
    if (path) {
      const article = await articleApi.getArticle({ path });
      setArticle(article);
    }
  }

  return (
    <Card sx={{padding: "20px"}}>
      <ReactMarkdown>{article?.content || ""}</ReactMarkdown>
    </Card>
  );
};

export default ArticleScreen;
