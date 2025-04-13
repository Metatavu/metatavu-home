import { useEffect, useState } from "react";
import { 
  CircularProgress, 
  Card, 
  Box, 
  TextField, 
  InputAdornment, 
  Grid, 
  Typography,
  Button, 
  FormControl, 
  Select, 
  MenuItem 
} from "@mui/material";
import { useAtomValue, useSetAtom } from "jotai";
import { useLambdasApi } from "src/hooks/use-api";
import { errorAtom } from "src/atoms/error";
import type { ArticleMetadata } from "src/generated/homeLambdasClient";
import { articleAtom } from "src/atoms/article";
import { Link } from "react-router-dom";
import { Search } from "@mui/icons-material";
import GridViewIcon from "@mui/icons-material/GridView";
import CarouselArticleCards from "../wiki-documentation/carousel-article-cards";
import strings from "src/localization/strings";

/**
 * Wiki documentation screen component displaying a list of articles.
 */
const WikiDocumantationScreen = () => {
  const setError = useSetAtom(errorAtom);
  const setArticlesAtom = useSetAtom(articleAtom);
  const articleAtomValue = useAtomValue(articleAtom);
  const { articleApi } = useLambdasApi();
  const initLoadingState = articleAtomValue?.length === 0;
  const [loading, setLoading] = useState(initLoadingState);
  const [articles, setArticles] = useState<ArticleMetadata[]>(articleAtomValue || []);
  const [selectOpen, setSelectOpen] = useState(false);
  const colors = {
    toolbar : {
      main: "#E9E8E8",
      hover: "#DCD8D8",
      text: "#787272"
    }
  }

  useEffect(() => {
    if (articleAtomValue.length === 0) getArticles();
  }, []);

  const getArticles = async () => {
    try {
      const fetchedArticles = await articleApi.getArticles();
      setArticles(fetchedArticles ?? []);
      setArticlesAtom(fetchedArticles ?? []);
    } catch (error) {
      setError(`${error}`);
    }
    setTimeout(()=> {
      setLoading(false);
    }, 1000)
  };

  const renderArticleCard = (article: ArticleMetadata) =>
    <Link to={article.path}>
      <Card sx={{
        padding: "20px", 
        position: "relative", 
        borderRadius: "20px",
        width: { lg: "260px" },
        maxWidth: { md: "360px", sm: "400px" },
        height: { lg: "274px", md: "294px", sm: "310px" }
      }}>
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
          <Typography variant="h6" sx={{textAlign: "left", paddingLeft: "20px"}}>
            {article.title}
          </Typography>
      </Card>
    </Link>

  const renderSearch = () =>
    <Card sx={{width: {md:"55%", xs:"100%"}, boxShadow: 2, marginBottom: {xs: 2}}}>
      <Box sx={{ 
        display: "flex", 
        justifyContent: "center", 
        backgroundColor: colors.toolbar.main
      }}>
        <TextField
          // value={searchInput}
          // onChange={handleSearchInputChange}
          placeholder={strings.timebank.searchPlaceholder}
          variant="outlined"
          disabled={loading}
          sx={{ 
            width: "99%", 
            padding: 1, 
            "& .MuiOutlinedInput-root": { 
              height: "34px",
              "& fieldset": {
                border: "none",
              }
            }}
          }
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            )
          }}
        />
      </Box>
    </Card>

  const renderCreateButton = () => 
    <Button
      variant="contained"
      sx={{
        width: {md: "15%", sm: "40%", xs:"35%"},
        height: "50px",
        backgroundColor: colors.toolbar.main,
        color: colors.toolbar.text,
        "&:hover": {backgroundColor: colors.toolbar.hover}
      }}
    >
      <Typography variant={"body1"} marginLeft={1} sx={{fontWeight: "bold"}}>
        Create
      </Typography>
    </Button>

  const renderListViewButton = () => 
    <Button variant="contained" sx={{
      maxWidth: "32px", 
      height: "50px",
      backgroundColor: colors.toolbar.main, 
      "&:hover": {backgroundColor: colors.toolbar.hover}
    }} 
    size="small"
    >
      <GridViewIcon sx={{color: colors.toolbar.text}}/>
    </Button>

  const renderDropdownMenu = () => 
    <FormControl
      sx={{
        width: {md: "20%", sm: "40%", xs:"35%"},
        color: colors.toolbar.text,
        '& .css-eqd77p-MuiSelect-select-MuiInputBase-input-MuiOutlinedInput-input.MuiSelect-select': {
          height: '33px'
        },
        "& fieldset": { border: 'none' },
      }}
      size="small"
    >
      <Select
        value={1}
        onOpen={() => setSelectOpen(true)}
        onClose={() => setSelectOpen(false)}
        displayEmpty
        inputProps={{ 'aria-label': 'Without label' }}
        sx={{
          backgroundColor: colors.toolbar.main, 
          boxShadow: 2, 
          borderBottomLeftRadius: selectOpen ? "0px" : "15px",
          borderBottomRightRadius: selectOpen ? "0px" : "15px",
          "&:hover": {
            backgroundColor: colors.toolbar.hover
          }
        }}
        MenuProps={{
          PaperProps: {
            sx: {
              borderTopLeftRadius: "0px",
              borderTopRightRadius: "0px",
              backgroundColor: colors.toolbar.main
            },
          },
        }}
      >
        <MenuItem sx={{backgroundColor: colors.toolbar.main, "&:hover": {backgroundColor: colors.toolbar.hover}}} value="">
          <em>None</em>
        </MenuItem>
      </Select>
    </FormControl>

  const renderToolBar = () => 
    <Grid
      container 
      justifyContent={"space-between"} 
      sx={{
        marginTop: articles.length !== 0 ? 8 : 2, 
        marginBottom: 2
      }}
    >
      {renderSearch()}
      {renderDropdownMenu()}
      {renderListViewButton()}
      {renderCreateButton()}
    </Grid>

  return (
    <>
      {loading ? (
        <Card sx={{ 
          p: "25%", 
          display: "flex", 
          justifyContent: "center" 
        }}>
          {<CircularProgress sx={{ scale: "150%" }} />}
        </Card>
      ) : 
      (
        <>
          <Typography variant="h5" sx={{ 
            fontWeight: "bold", 
            marginTop: 4, 
            marginBottom: 2, 
            marginLeft: 3
          }}>
            {strings.wikiDocumentation.cardTitle}
          </Typography>
          {articles && articles.length !== 0 ? 
            <>
              <CarouselArticleCards articles={articles}/>
              <Box sx={{paddingLeft: 3, paddingRight: 3}}>
                {renderToolBar()}
                <Grid 
                  container 
                  spacing={3}
                  textAlign={"center"}
                >
                  {articles.map(article => 
                    <Grid item lg={3} md={4} sm={6} xs={12}>
                      {renderArticleCard(article)}
                    </Grid>
                  )}
                </Grid>
              </Box>
            </>
            : renderToolBar()
          }
        </>
      )}
    </>
  );
};

export default WikiDocumantationScreen;