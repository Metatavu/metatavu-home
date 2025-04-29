import { Box, Button, Card, Chip, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import type { ArticleMetadata } from "src/generated/homeLambdasClient";
import strings from "src/localization/strings";
import { getLastActivityString } from "src/utils/wiki-utils";

interface Props {
  article: ArticleMetadata,
  adminMode: boolean,
  handleDelete: (articleId?: string) => void
}

const ArticleCard = ({article, adminMode, handleDelete} : Props) => {
  if (!article || !article.lastUpdatedAt) return;
  const lastActivityData = getLastActivityString(article);

  return (
    <Link to={article.path} style={{ textDecoration: "none"}}>
      <Card 
        key={`article-card-${article.id}`}
        sx={{
          padding: "20px", 
          position: "relative", 
          borderRadius: "20px",
          width: { lg: "260px" },
          maxWidth: { md: "360px", sm: "400px" },
          height: adminMode ? { lg: "394px", md: "414px", sm: "420px", xs: "530px" } 
          : { lg: "354px", md: "374px", sm: "380px", xs: "485px" }
        }}
      >
        <Box
          component="img"
          sx={{
            width: "100%",
            height: { lg: "170px", md: "190px", sm: "200px", xs: "300px" },
            borderRadius: "20px",
            marginRight: "10px",
            objectFit: "cover",
            overflow: "hidden"
          }}
          alt={article.title}
          src={article.coverImage}
        />
        <Typography 
          variant="h6" 
          sx={{
            paddingLeft: "5px",
            textAlign: "left", 
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "normal",
            wordBreak: "break-word",
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 1
          }}
        >
          {article.title}
        </Typography>
        <Typography variant="body1" sx={{ paddingLeft: "5px", textAlign: "left" }}>
          {strings.formatString(
            "{0} {1}",
            lastActivityData.action, 
            article.lastUpdatedAt.toLocaleDateString())
          }
        </Typography>
        <Typography variant="body1" sx={{ paddingLeft: "5px", textAlign: "left" }}>
          {strings.formatString(
            "by {0}",
            lastActivityData.user || "")
          }
        </Typography>
        <Box sx={{
          textAlign: "left", 
          marginTop: 1, 
          maxHeight: "38px", 
          overflow: "hidden"
          }}
        >
          {article.tags?.map((tag) => 
            <Chip label={tag} sx={{marginRight: 1, marginTop: 0.5}} key={`${article.id}-${tag}`}/>
          )}
        </Box>
        {adminMode && 
          <Button 
            variant="outlined" 
            size="small" 
            sx={{marginTop: 2, zIndex: 10}} 
            fullWidth
            onClick={(event) => {
              event.preventDefault(); 
              handleDelete(article.id)
            }}
          >
            {strings.questionnaireTable.delete}
          </Button>
        }
      </Card>
    </Link>
  )
}

export default ArticleCard;