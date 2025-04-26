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
import { articleAtom, draftArticleAtom } from "src/atoms/article";
import { Link } from "react-router-dom";
import { Search } from "@mui/icons-material";
import GridViewIcon from "@mui/icons-material/GridView";
import strings from "src/localization/strings";
import { wikiScreenColors } from "src/theme";
import CreateOrEditArticleForm from "../wiki-documentation/create-article-form";
import UserRoleUtils from "src/utils/user-role-utils";

const colors = wikiScreenColors;

/**
 * Wiki documentation screen component displaying a list of articles.
 */
const AdminWikiScreen = () => {
  const adminMode = UserRoleUtils.adminMode();
  const setError = useSetAtom(errorAtom);
  const setArticlesAtom = useSetAtom(articleAtom);
  const setDraftArticlesAtom = useSetAtom(draftArticleAtom);
  const draftArticles = useAtomValue(draftArticleAtom);
  const articles = useAtomValue(articleAtom);
  const { articleApi } = useLambdasApi();
  const initLoadingState = articles?.length === 0;
  const [loading, setLoading] = useState(initLoadingState);
  const [formOpen,  setFormOpen] = useState(false);
  const [dispayedArticles, setDisplayedArticles] = useState<ArticleMetadata[]>(articles);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  // const [selectOpen, setSelectOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [displayOption, setDisplayOption] = useState("all");

  useEffect(() => {
    if (articles.length === 0) getArticles();
    else {
      getTags(articles);
      setDisplayedArticles(articles);
    }
  }, [articles, draftArticles]);

  const getArticles = async () => {
    try {
      const fetchedArticles = await articleApi.getArticles();
      const fetchedDraftArticles = await articleApi.getArticles({draft: true});
      setDisplayedArticles(fetchedArticles);
      setArticlesAtom(fetchedArticles);
      setDraftArticlesAtom(fetchedDraftArticles);
      getTags(fetchedArticles);
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
      setDisplayedArticles(displayOption === "draft" ? draftArticles : articles);
      return;
    }

    const filteredArticles = (displayOption === "draft" ? draftArticles : articles)
      .filter(article => article.title.toLowerCase().includes(newSearchInput.toLowerCase()) && 
        selectedTags.every(tag => article.tags?.includes(tag))
    );
    setDisplayedArticles(filteredArticles);
  }

  const handleSelectedTagChange = (values: string[]) => {
    setSelectedTags(values);
    const filteredArticles = (displayOption === "draft" ? draftArticles : articles)
      .filter(article => 
        article.title.toLowerCase().includes(searchInput.toLowerCase()) && 
        values.every(tag => article.tags?.includes(tag))
      );
    setDisplayedArticles(filteredArticles);
  }

  const renderArticleCard = (article: ArticleMetadata) => (
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
  )

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
        md:"60%",
        xs:"100%"
      }, 
      boxShadow: 2, 
      marginBottom: {xs: 2}
    }}>
      <Box sx={{ 
        display: "flex", 
        justifyContent: "center", 
        backgroundColor: colors.button.main
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
                xs: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)"
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
          md: "15%",
          sm: "40%", 
          xs:"35%"
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
    <Button variant="contained" sx={{
      maxWidth: "32px", 
      height: "55px",
      backgroundColor: colors.button.main, 
      "&:hover": {backgroundColor: colors.button.hover}
    }} 
    size="small"
    >
      <GridViewIcon sx={{color: colors.button.text}}/>
    </Button>
  );

  const handleDisplayOptionChange = (event: SelectChangeEvent<string>) => {
    const newOption = event.target.value;
    setDisplayOption(newOption);
    if (newOption === "draft") 
      setDisplayedArticles(draftArticles)
    else setDisplayedArticles(articles)
  }

  const renderDropdownMenu = () => (
    <FormControl
      sx={{
        width: {
          md: "15%", 
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

  const renderToolBar = () => (
    <Grid
      container 
      justifyContent={"space-between"} 
    >
      {renderSearch()}
      {renderDropdownMenu()}
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
            <CreateOrEditArticleForm setFormOpen={setFormOpen} action="create" adminMode={adminMode}/>
          ) :
          (
            <>
              {articles && articles.length !== 0 ? 
                <>
                  <Box sx={{ marginTop: 4}}>
                    {renderToolBar()}
                    <Grid 
                      container 
                      spacing={3}
                      textAlign={"center"}
                    >
                      {dispayedArticles.map(article => 
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
      )}
    </>
  );
};

export default AdminWikiScreen;