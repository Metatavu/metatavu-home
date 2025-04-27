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
  type SelectChangeEvent
} from "@mui/material";
import { useAtomValue, useSetAtom } from "jotai";
import { useLambdasApi } from "src/hooks/use-api";
import { errorAtom } from "src/atoms/error";
import type { ArticleMetadata } from "src/generated/homeLambdasClient";
import { articleAtom, draftArticleAtom, tagsAtom } from "src/atoms/article";
import { Link } from "react-router-dom";
import { Search } from "@mui/icons-material";
import GridViewIcon from "@mui/icons-material/GridView";
import SearchOffIcon from '@mui/icons-material/SearchOff';
import CarouselArticleCards from "../wiki-documentation/carousel-article-cards";
import strings from "src/localization/strings";
import { wikiScreenColors } from "src/theme";
import CreateOrEditArticleForm from "../wiki-documentation/create-article-form";
import UserRoleUtils from "src/utils/user-role-utils";

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
  const initLoadingState = articles?.length === 0;
  const [loading, setLoading] = useState(initLoadingState);
  const [formOpen,  setFormOpen] = useState(false);
  const [dispayedArticles, setDisplayedArticles] = useState<ArticleMetadata[]>(articles);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [displayOption, setDisplayOption] = useState("all");

  useEffect(() => {
    if (articles.length === 0) getArticles();
    else {
      getTags(adminMode ? articles.concat(draftArticles) : articles);
      setDisplayedArticles(articles);
    }
  }, [articles, draftArticles]);

  const getArticles = async () => {
    try {
      const fetchedArticles = await articleApi.getArticles();
      setDisplayedArticles(fetchedArticles);
      setArticlesAtom(fetchedArticles);
      if (adminMode) {
        const fetchedDraftArticles = await articleApi.getArticles({draft: true});
        setDraftArticlesAtom(fetchedDraftArticles);
        getTags(fetchedArticles.concat(fetchedDraftArticles));
      }
      else getTags(fetchedArticles);
    } catch (error) {
      setError(`${error}`);
    }
    setTimeout(()=> {
      setLoading(false);
    }, 1000)
  };

  const getTags = (fetchedArticles: ArticleMetadata[]) => {
    const allTags = fetchedArticles.flatMap(article => article.tags || []);
    const uniqueTags = [...new Set(allTags)];
    setTags(uniqueTags);
  }

  const handleSearchInputChange = (event: any) => {
    const newSearchInput = event.target.value;
    setSearchInput(newSearchInput || "");

    if (!newSearchInput || newSearchInput === "") {
      setDisplayedArticles(adminMode && displayOption === "draft" ? draftArticles : articles);
      return;
    }

    const filteredArticles = (adminMode && displayOption === "draft" ? draftArticles : articles)
      .filter(article => 
        article.title.toLowerCase().includes(newSearchInput.toLowerCase()) && 
        selectedTags.every(tag => article.tags?.includes(tag))
    );
    setDisplayedArticles(filteredArticles);
  }

  const handleSelectedTagChange = (values: string[]) => {
    setSelectedTags(values);
    const filteredArticles = (adminMode && displayOption === "draft" ? draftArticles : articles)
      .filter(article => 
        article.title.toLowerCase().includes(searchInput.toLowerCase()) && 
        values.every(tag => article.tags?.includes(tag))
    );
    setDisplayedArticles(filteredArticles);
  }

  const handleDisplayOptionChange = (event: SelectChangeEvent<string>) => {
    const newOption = event.target.value;
    setDisplayOption(newOption);
    if (newOption === "draft") 
      setDisplayedArticles(draftArticles)
    else setDisplayedArticles(articles)
  }

  const renderArticleCard = (article: ArticleMetadata) => (
    <Link to={article.path}>
      <Card 
        key={`article-card-${article.id}`}
        sx={{
          padding: "20px", 
          position: "relative", 
          borderRadius: "20px",
          width: { lg: "260px" },
          maxWidth: { md: "360px", sm: "400px" },
          height: { lg: "274px", md: "294px", sm: "310px" }
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
          <Typography variant="h6" sx={{textAlign: "left", paddingLeft: "20px"}}>
            {article.title}
          </Typography>
      </Card>
    </Link>
  );

  const CustomPopper = styled((props: PopperProps) => <Popper {...props} placement="bottom" />)({
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
  )

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
  )

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
    >
      <GridViewIcon sx={{color: colors.button.text}}/>
    </Button>
  )

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
              borderTopLeftRadius: "0px",
              borderTopRightRadius: "0px",
              backgroundColor: colors.button.main
            },
          },
        }}
      >
        <MenuItem sx={{
          color: colors.button.text,
          backgroundColor: colors.button.main, 
          "&:hover": {
            backgroundColor: colors.button.hover
          }}} 
          value="all"
        >
          all
        </MenuItem> 
        <MenuItem sx={{
          color: colors.button.text,
          backgroundColor: colors.button.main, 
          "&:hover": {
            backgroundColor: colors.button.hover
          }}} 
          value="draft"
        >
          draft
        </MenuItem>
      </Select>
    </FormControl>
  )

  const renderTitle = (text: string) => (
    <Typography variant="h4" sx={{ 
      fontWeight: "bold", 
      marginTop: 4, 
      marginBottom: 1, 
      marginLeft: 3
    }}>
      {text}
    </Typography>
  )

  const renderToolBar = () => (
    <Grid
      container 
      justifyContent={"space-between"} 
      sx={{
        marginTop: articles.length !== 0 ? 4 : 2, 
        marginBottom: 2
      }}
    >
      {renderSearch()}
      {adminMode && renderDropdownMenu()}
      {renderListViewButton()}
      {renderCreateButton()}
    </Grid>
  )

  return (
    <>
      {loading ? (
        <Card sx={{ 
          p: "25%", 
          display: "flex", 
          justifyContent: "center" 
        }}>
          <CircularProgress sx={{ scale: "150%" }} />
        </Card>
      ) : 
      (
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
              {!adminMode && renderTitle(strings.wikiDocumentation.cardTitle)}
              {dispayedArticles.length !== 0 ? 
                <>
                  {!adminMode && <CarouselArticleCards articles={articles}/>}
                  <Box sx={adminMode ? {marginTop: 4} : {paddingLeft: 3, paddingRight: 3}}>
                    {renderToolBar()}
                    <Grid 
                      container 
                      spacing={4}
                      textAlign={"center"}
                    >
                      {dispayedArticles.map(article => 
                        <Grid item lg={3} md={4} sm={6} xs={12} key={`article-grid-item-${article.id}`}>
                          {renderArticleCard(article)}
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                </>
                : 
                <>
                  {renderToolBar()}
                  <Grid 
                    container 
                    justifyContent="center"
                    sx={{color: colors.button.text}}
                  >
                    <SearchOffIcon/>
                    <Typography variant="body1" sx={{}}>
                      {strings.wikiDocumentation.noArticlesFound} 
                    </Typography> 
                  </Grid>            
                </>
              }
            </>
          )}
        </>
      )}
    </>
  );
};

export default WikiDocumentationScreen;