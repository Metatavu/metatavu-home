import { Box, Card, Chip, Grid, IconButton, Typography } from "@mui/material";
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useEffect, useState } from "react";
import type { ArticleMetadata } from "src/generated/homeLambdasClient";

/**
 * Carousel component displaying article cards.
 */
const CarouselArticleCards = ({articles}: {articles: ArticleMetadata[]}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [jumping, setJumping] = useState(false);

  const clonedArticles = [
    {...articles[articles.length - 1], id: "last-article-clone"},
    ...articles,
    {...articles[0], id: "first-article-clone"}
  ];

  const articlesCount = clonedArticles.length;

  useEffect(()=> {
    if (currentPage === 0) {
      setTimeout(()=> {
        setJumping(true);
        setCurrentPage(articlesCount-2);
      }, 500);
    }
    else if (currentPage === articlesCount-1) {
      setTimeout(()=> {
        setJumping(true);
        setCurrentPage(1);
      }, 500);
    }
  }, [currentPage]);

  useEffect(() => {
    if (jumping) 
      setTimeout(()=> {
      setJumping(false);
    }, 50)
  }, [jumping]);

  const handlePreviousPage = () =>
    setCurrentPage( currentPage - 1);

  const handleNextPage = () => 
    setCurrentPage( currentPage+1);

  return (
    <Card sx={{ position: "relative" }}>
      <IconButton onClick={handlePreviousPage} sx={{
        position: "absolute", 
        left: "0", 
        top: "50%", 
        transform: "translateY(-50%)",
        zIndex: 1
      }}>
        <NavigateBeforeIcon/>
      </IconButton>

      <IconButton onClick={handleNextPage} sx={{
        position: "absolute", 
        right: "0", 
        top: "50%", 
        transform: "translateY(-50%)",
        zIndex: 1
      }}>
        <NavigateNextIcon/>
      </IconButton>
      <Box
        sx={{
          display: "flex",
          width: "100%",
          height: { md: "420px", sm: "330px" },
          transform: `translateX(-${currentPage * 100}%)`,
          transition: jumping ? "none" : "transform 0.5s ease-in-out"
        }}
      >
        {clonedArticles.map((article) => (
          <Box
            key={`article-card-${article.id}`}
            sx={{
              flex: "0 0 100%",
              width: "100%",
              height: "100%",
              padding: { md: "40px", xs: "40px" },
              backgroundColor: "#F7F7F7"
            }}
          >
            <Grid container spacing={3}>
              <Grid item sm={6} xs={12}>
                <Box
                  component="img"
                  sx={{
                    width: "100%",
                    maxWidth: { sm: "440px" },
                    height: { md: "330px", sm: "250px", xs: "270px" },
                    borderRadius: "20px",
                    objectFit: "cover",
                    overflow: "hidden"
                  }}
                  alt={article.title}
                  src={article.coverImage}
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                <Typography 
                  variant="h5"
                  sx={{ 
                    fontWeight: "bold", 
                    fontSize: "25px",
                    overflow: "hidden",
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 1
                  }}
                >
                  {article.title}
                </Typography>
                <Typography sx={{ 
                  fontSize: "22px", 
                  marginTop: 4, 
                  marginBottom: 4,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: { md: 6, sm: 4, xs: 3 }
                }}>
                  {article.description}
                </Typography>
                {article.tags?.map((tag) => 
                  <Chip label={tag} sx={{marginRight: 1}} key={`carousel-${article.id}-${tag}`}/>
                )}
              </Grid>
            </Grid>
          </Box>
        ))}
      </Box>
    </Card>
  )
}

export default CarouselArticleCards;