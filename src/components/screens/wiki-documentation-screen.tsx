import {useEffect, useState } from "react";
import { 
  CircularProgress, 
  Card, 
  Box, 
  TextField, 
  Grid, 
  Typography,
  Button, 
  FormControl, 
  Select, 
  MenuItem, 
  Autocomplete,
  IconButton,
  Checkbox,
  styled,
  type PopperProps,
  Popper,
  type SelectChangeEvent,
  Chip
} from "@mui/material";
import { useAtomValue, useSetAtom } from "jotai";
import { useLambdasApi } from "src/hooks/use-api";
import { errorAtom } from "src/atoms/error";
import type { ArticleMetadata } from "src/generated/homeLambdasClient";
import { articleAtom, draftArticleAtom, tagsAtom } from "src/atoms/article";
import { Link } from "react-router-dom";
import { Search } from "@mui/icons-material";
import GridViewIcon from "@mui/icons-material/GridView";
import FormatListBulletedOutlinedIcon from '@mui/icons-material/FormatListBulletedOutlined';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import CarouselArticleCards from "../wiki-documentation/carousel-article-cards";
import strings from "src/localization/strings";
import { wikiScreenColors } from "src/theme";
import CreateOrEditArticleForm from "../wiki-documentation/create-article-form";
import UserRoleUtils from "src/utils/user-role-utils";
import { getLastActivityString } from "src/utils/wiki-utils";

const colors = wikiScreenColors;

/**
 * Wiki documentation screen component displaying a list of articles.
 */
const WikiDocumentationScreen = () => {
  const adminMode = UserRoleUtils.adminMode();
  const setError = useSetAtom(errorAtom);
  const setArticlesAtom = useSetAtom(articleAtom);
  const setDraftArticlesAtom = useSetAtom(draftArticleAtom);
  const setTags = useSetAtom(tagsAtom)
  const draftArticles = useAtomValue(draftArticleAtom);
  const articles = useAtomValue(articleAtom);
  const tags = useAtomValue(tagsAtom);
  const { articleApi } = useLambdasApi();
  const initLoadingState = !articles;
  const [loading, setLoading] = useState(initLoadingState);
  const [formOpen,  setFormOpen] = useState(false);
  const [listView, setListView] = useState(false);
  const [displayedArticles, setDisplayedArticles] = useState<ArticleMetadata[]>(articles || []);
  const [lastUpdatedArticles, setlastUpdatedArticles] = useState<ArticleMetadata[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [displayOption, setDisplayOption] = useState("all");

  useEffect(() => {
    if (!articles) getArticles();
    else if (articles.length !== 0){
      if (!adminMode) getLastUpdatedArticles(articles);
      getTags(adminMode ? articles.concat(draftArticles || []) : articles);
      setDisplayedArticles(articles);
    }
  }, [articles, draftArticles]);

  const getArticles = async () => {
    try {
      const fetchedArticles = await articleApi.getArticles();
      setDisplayedArticles(fetchedArticles || []);
      setArticlesAtom(fetchedArticles || []);
      if (adminMode) {
        const fetchedDraftArticles = await articleApi.getArticles({draft: true});
        setDraftArticlesAtom(fetchedDraftArticles);
        getTags(fetchedArticles.concat(fetchedDraftArticles));
      }
      else getTags(fetchedArticles);
      if (!adminMode) getLastUpdatedArticles(fetchedArticles)
    } catch (error: any) {
      const message = (await error.response.json()).message;
      setError(message);
    }
    setTimeout(()=> {
      setLoading(false);
    }, 1000)
  };

  const getTags = (articles: ArticleMetadata[]) => {
    const allTags = articles.flatMap(article => article.tags || []);
    const uniqueTags = [...new Set(allTags)];
    setTags(uniqueTags);
  };

  const getLastUpdatedArticles = (articles: ArticleMetadata[]) => {
    let lastCreatedArticleFound = false;
    let lastUpdatedArticleFound = false;
    let lastReadArticleFound = false;
    const lastUpdatedArticles = [];
    let i = 0;
    while (
      (!lastCreatedArticleFound 
      || !lastUpdatedArticleFound 
      || !lastReadArticleFound)
      && i < articles.length
    ) {
      const lastUpdatedAt = articles[i].lastUpdatedAt?.getTime();
      const createdAt = articles[i].createdAt?.getTime();
      const lastReadAt = articles[i].lastReadAt?.getTime();
      if (!lastCreatedArticleFound && lastUpdatedAt === createdAt) {
        lastUpdatedArticles.push(articles[i])
        lastCreatedArticleFound = true;
      }
      else if (!lastReadArticleFound && lastUpdatedAt === lastReadAt) {
        lastUpdatedArticles.push(articles[i])
        lastReadArticleFound = true;
      }
      else if (!lastUpdatedArticleFound) {
        lastUpdatedArticles.push(articles[i])
        lastUpdatedArticleFound = true;
      }
      i++
    }
    setlastUpdatedArticles(lastUpdatedArticles)
  };

  const handleDelete = async(articleId?: string) => {
    if (!articleId) return;
    try {
      await articleApi.deleteArticle({id: articleId});
      setArticlesAtom((articles) => (articles || []).filter(article => article.id !== articleId))
    } catch(error: any) {
      const message = (await error.response.json()).message;
      setError(message);
    }
  }

  const handleSearchInputChange = (event: any) => {
    const newSearchInput = event.target.value;
    setSearchInput(newSearchInput || "");

    if (!newSearchInput || newSearchInput === "") {
      setDisplayedArticles(adminMode && displayOption === "draft" ? draftArticles || [] : articles || []);
      return;
    }

    const filteredArticles = (adminMode && displayOption === "draft" ? draftArticles || [] : articles || [])
      .filter(article => 
        article.title.toLowerCase().includes(newSearchInput.toLowerCase()) && 
        selectedTags.every(tag => article.tags?.includes(tag))
    );
    setDisplayedArticles(filteredArticles);
  };

  const handleSelectedTagChange = (values: string[]) => {
    setSelectedTags(values);
    const filteredArticles = (adminMode && displayOption === "draft" ? draftArticles || [] : articles || [])
      .filter(article => 
        article.title.toLowerCase().includes(searchInput.toLowerCase()) && 
        values.every(tag => article.tags?.includes(tag))
    );
    setDisplayedArticles(filteredArticles);
  };;

  const handleDisplayOptionChange = (event: SelectChangeEvent<string>) => {
    const newOption = event.target.value;
    setDisplayOption(newOption);
    if (newOption === "draft") 
      setDisplayedArticles(draftArticles || [])
    else setDisplayedArticles(articles || [])
  };

  const renderArticleCard = (article: ArticleMetadata) => {
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
              delete
            </Button>
          }
        </Card>
      </Link>
    )
  }

  const renderArticleListItem = (article: ArticleMetadata) => {
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
            width: "100%"
          }}
        >
          <Grid container spacing={3}>
            <Grid item lg={2.7} md={3.5} sm={5} xs={12}>
              <Box
                component="img"
                sx={{
                  width: "100%",
                  height: { lg: "185px", md: "190px", sm: "215px", xs: "300px" },
                  borderRadius: "20px",
                  marginRight: "10px",
                  objectFit: "cover",
                  overflow: "hidden"
                }}
                alt={article.title}
                src={article.coverImage}
              />
            </Grid>
            <Grid item lg={8.6} md={8} sm={6} xs={12}>
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
                  WebkitLineClamp: 1,
                  marginBottom: adminMode ? 1.5 : 3
                }}
              >
                {article.title}
              </Typography>
              <Typography 
                sx={{
                  paddingLeft: "5px",
                  textAlign: "left", 
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: {xs: 2, sm: adminMode ? 2 : 3}
                }}
              >
                {article.description}
              </Typography>
              <Grid container justifyContent={"space-between"} sx={{ marginTop: {lg: 1.5, md: 2, sm: 1.5}}}  direction={{ xs: "column", md: "row" }}>
                <Grid item sx={{order: {xs: 2, md: 1}}}>
                  <Box sx={{
                    textAlign: "left", 
                    maxHeight: "38px", 
                    overflow: "hidden",
                    }}
                  >
                    {article.tags?.map((tag) => 
                      <Chip label={tag} sx={{ marginRight: 1, marginTop: 0.5}} key={`${article.id}-${tag}`}/>
                    )}
                  </Box>
                </Grid>
                <Grid item sx={{order: {as: 1, md: 2}}}>
                  <Typography variant="body1" sx={{ paddingLeft: "5px", textAlign: "left", paddingTop: 0.5 }}>
                    {strings.formatString(
                      "{0} {1} by {2}",
                      lastActivityData.action, 
                      article.lastUpdatedAt.toLocaleDateString(),
                      lastActivityData.user || "")
                    }
                  </Typography>
                </Grid>
              </Grid>
              {adminMode && 
                <Button 
                  variant="outlined" 
                  size="small" 
                  sx={{marginTop: 1, zIndex: 10}} 
                  fullWidth
                  onClick={(event) => {
                    event.preventDefault(); 
                    handleDelete(article.id)
                  }}
                >
                  delete
                </Button>
              }
            </Grid>
          </Grid>
        </Card>
      </Link>
    )
  }

  const CustomPopper = styled((props: PopperProps) => 
    <Popper {...props} placement="bottom" />)({
    "& .MuiAutocomplete-noOptions": {
      display: "none"
    },
    "& .MuiAutocomplete-paper": {
      marginTop: "10px",
      backgroundColor: colors.button.main,
      color: colors.button.text
    }
  });

  const renderSearch = () => (
    <Card sx={{
      width: {
        lg: adminMode ? "55%" : "73%",
        md: adminMode ? "55%" : "calc(100% - 80px)",
        xs: adminMode ? "100%": "calc(100% - 80px);"
      }, 
      boxShadow: 2, 
      marginBottom: {xs: 2}
    }}>
      <Box sx={{ 
        display: "flex", 
        justifyContent: "center", 
        backgroundColor: colors.button.main,
        
      }}>
        <Autocomplete
          PopperComponent={CustomPopper}
          multiple
          disableCloseOnSelect
          id="checkboxes-tags-select-component"
          options={tags}
          sx={{width:"100%"}}
          clearOnBlur={false}
          inputValue={searchInput}
          onInputChange={handleSearchInputChange}
          onChange={(_event, values) => {
            handleSelectedTagChange(values)
          }}
          size="small"
          renderOption={(props, option, { selected }) => (
            <li
              {...props}
              style={{ display: "flex", alignItems: "center" }}
              key={`tags-option-${option}`}
            >
              <Checkbox sx={{
                  color: colors.button.text, 
                  marginRight: 2,
                }} 
                checked={selected} 
              />
              <Box
                minWidth="5px"
                style={{ marginRight: "10px" }}
                component="span"
                sx={{
                  height: 40,
                  borderRadius: "5px"
                }}
              />
              {option}
            </li>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={strings.wikiDocumentation.searchArticle}
              sx={{
                "& fieldset": {
                  border: "none",
                  marginBottom: "20px"
                }
              }}
              InputProps={{
                ...params.InputProps,
                endAdornment: null,
                startAdornment: (
                  <>
                    <IconButton>
                      <Search />
                    </IconButton>
                    {params.InputProps.startAdornment}
                  </>
                )
              }}
            />
          )}
          ListboxProps={{
            sx: {
              display: "grid",
              columnGap: 3,
              rowGap: 1,
              gridTemplateColumns: {
                xs: adminMode ? "repeat(2, 1fr)" : "repeat(2, 1fr)",
                md: adminMode ? "repeat(2, 1fr)" : "repeat(3, 1fr)"
              }
            }
          }}
        />
      </Box>
    </Card>
  );

  const renderCreateButton = () => (
    <Button
      onClick={() => setFormOpen(true)}
      variant="contained"
      sx={{
        width: {
          lg: "17%",
          md: adminMode ? "17%" : "100%",
          xs: adminMode ? "40%" : "100%"
        },
        height: "55px",
        backgroundColor: colors.button.main,
        color: colors.button.text,
        "&:hover": {backgroundColor: colors.button.hover}
      }}
    >
      <Typography 
        variant={"body1"} 
        marginLeft={1} 
        sx={{fontWeight: "bold"}}
      >
        {strings.wikiDocumentation.create}
      </Typography>
    </Button>
  );

  const renderListViewButton = () => (
    <Button 
      variant="contained" 
      sx={{
        maxWidth: "32px", 
        height: "55px",
        backgroundColor: colors.button.main, 
        "&:hover": {backgroundColor: colors.button.hover}
      }} 
      size="small"
      onClick={()=>setListView(!listView)}
    >
      {listView 
        ? <FormatListBulletedOutlinedIcon sx={{color: colors.button.text}}/> 
        : <GridViewIcon sx={{color: colors.button.text}}/>
      }
    </Button>
  );

  const renderDropdownMenu = () => (
    <FormControl
      sx={{
        width: {
          md: "17%", 
          sm: "40%", 
          xs:"35%"
        },
        color: colors.button.text,
        "& fieldset": { border: 'none' },
      }}
      size="medium"
    >
      <Select
        value={displayOption}
        onChange={handleDisplayOptionChange}
        displayEmpty
        inputProps={{ 'aria-label': 'Without label' }}
        sx={{
          backgroundColor: colors.button.main, 
          boxShadow: 2, 
          textAlign: "center",
          color: colors.button.text,
          fontWeight: "bold",
          textTransform: "uppercase",
          "&:hover": {
            backgroundColor: colors.button.hover
          }
        }}
        MenuProps={{
          PaperProps: {
            sx: {
              marginTop: "10px",
              borderTopLeftRadius: "0px",
              borderTopRightRadius: "0px",
              backgroundColor: colors.button.main,
            },
          },
        }}
      >
        <MenuItem sx={{
          textTransform: "uppercase",
          paddingLeft: 3,
          color: colors.button.text,
          backgroundColor: colors.button.main, 
          "&:hover": {
            backgroundColor: colors.button.hover
          }}} 
          value="all"
        >
          {strings.wikiDocumentation.allArticles}
        </MenuItem> 
        <MenuItem sx={{
          textTransform: "uppercase",
          paddingLeft: 3,
          color: colors.button.text,
          backgroundColor: colors.button.main, 
          "&:hover": {
            backgroundColor: colors.button.hover
          }}} 
          value="draft"
        >
          {strings.wikiDocumentation.draft}
        </MenuItem>
      </Select>
    </FormControl>
  );

  const renderTitle = (text: string) => (
    <Typography variant="h4" sx={{ 
      fontWeight: "bold", 
      marginTop: 4, 
      marginBottom: 1, 
      marginLeft: 3
    }}>
      {text}
    </Typography>
  );

  const renderToolBar = () => (
    <Grid
      container 
      justifyContent={"space-between"} 
      sx={{
        marginTop: articles && articles.length !== 0 ? 4 : 2, 
        marginBottom: 2
      }}
    >
      {renderSearch()}
      {adminMode && renderDropdownMenu()}
      {renderListViewButton()}
      {renderCreateButton()}
    </Grid>
  );

  return (
    <>
      {loading 
        ? (
          <Card sx={{ 
            p: "25%", 
            display: "flex", 
            justifyContent: "center" 
          }}>
            <CircularProgress sx={{ scale: "150%" }} />
          </Card>
        ) 
        : (
          <>
            {formOpen ? (
              <CreateOrEditArticleForm 
                setFormOpen={setFormOpen} 
                action="create" 
                adminMode={adminMode}
              />
            ) :
            (
              <>
                {!adminMode &&
                  <>
                    {renderTitle(strings.wikiDocumentation.cardTitle)}
                    {lastUpdatedArticles.length !== 0 && <CarouselArticleCards articles={lastUpdatedArticles}/>}
                  </> 
                }
                <Box sx={adminMode 
                  ? {marginTop: 4, marginBottom: 4} 
                  : {paddingLeft: 2, paddingRight: 2, marginBottom: 4}}
                >
                  {renderToolBar()}
                  {displayedArticles.length !== 0 ? 
                    <Grid 
                      container 
                      spacing={adminMode ? 4 : 3}
                      textAlign={"center"}
                    >
                      {displayedArticles.map(article => 
                        <Grid 
                          item 
                          lg={!listView ? 3 : 12} 
                          md={!listView ? 4 : 12} 
                          sm={!listView ? 6 : 12} 
                          xs={12} 
                          key={`article-grid-item-${article.id}`}
                        >
                          {listView 
                            ? renderArticleListItem(article)
                            : renderArticleCard(article)
                          }
                        </Grid>
                      )}
                    </Grid>
                    :
                    <Grid 
                      container 
                      justifyContent="center"
                      sx={{color: colors.button.text}}
                    >
                      <SearchOffIcon/>
                      <Typography variant="body1">
                        {strings.wikiDocumentation.noArticlesFound} 
                      </Typography> 
                    </Grid>
                  }
                </Box>
              </>
              )
            }
          </>
        )
      }
    </>
  );
};

export default WikiDocumentationScreen;