import { useEffect, useState } from "react";
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
  Snackbar,
  Alert,
  type PopperProps,
  Popper,
  type SelectChangeEvent,
  Pagination
} from "@mui/material";
import { useAtomValue, useSetAtom, useAtom } from "jotai";
import { useLambdasApi } from "src/hooks/use-api";
import { errorAtom } from "src/atoms/error";
import type { ArticleMetadata } from "src/generated/homeLambdasClient";
import { articleAtom, draftArticleAtom, tagsAtom } from "src/atoms/article";
import { Search } from "@mui/icons-material";
import GridViewIcon from "@mui/icons-material/GridView";
import FormatListBulletedOutlinedIcon from "@mui/icons-material/FormatListBulletedOutlined";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import CarouselArticleCards from "../wiki-documentation/carousel-article-cards";
import strings from "src/localization/strings";
import { wikiScreenColors } from "src/theme";
import CreateOrEditArticleForm from "../wiki-documentation/create-article-form";
import UserRoleUtils from "src/utils/user-role-utils";
import ArticleCard from "../wiki-documentation/article-card";
import ArticleListItem from "../wiki-documentation/article-list-item";
import { snackbarAtom } from "src/atoms/snackbar";

const colors = wikiScreenColors;
const itemsPerPage = 12;

/**
 * Wiki documentation screen component displaying a list of articles.
 */
const WikiDocumentationScreen = () => {
  const adminMode = UserRoleUtils.adminMode();
  const setError = useSetAtom(errorAtom);
  const setArticlesAtom = useSetAtom(articleAtom);
  const setDraftArticlesAtom = useSetAtom(draftArticleAtom);
  const setTags = useSetAtom(tagsAtom);
  const draftArticles = useAtomValue(draftArticleAtom);
  const articles = useAtomValue(articleAtom);
  const tags = useAtomValue(tagsAtom);
  const { articleApi } = useLambdasApi();
  const initLoadingState = !articles;
  const [loading, setLoading] = useState(initLoadingState);
  const [formOpen, setFormOpen] = useState(false);
  const [listView, setListView] = useState(false);
  const [displayedArticles, setDisplayedArticles] = useState<ArticleMetadata[]>(articles ?? []);
  const [displayedArticlesOnPage, setDisplayedArticlesOnPage] = useState<ArticleMetadata[]>(
    articles?.slice(0, itemsPerPage) ?? []
  );
  const [lastUpdatedArticles, setlastUpdatedArticles] = useState<ArticleMetadata[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [displayOption, setDisplayOption] = useState("all");
  const [pageNumber, setPageNumber] = useState(1);
  const [snackbar, setSnackbar] = useAtom(snackbarAtom);

  useEffect(() => {
    if (!articles) getArticles();
    else if (articles.length !== 0) {
      if (!adminMode) getLastUpdatedArticles(articles);
      getTags(adminMode ? articles.concat(draftArticles ?? []) : articles);
      setDisplayedArticles(articles);
    }
  }, [articles, draftArticles]);

  useEffect(() => {
    setDisplayedArticlesOnPage(
      displayedArticles.slice((pageNumber - 1) * itemsPerPage, itemsPerPage * pageNumber)
    );
  }, [pageNumber, displayedArticles]);
  /**
   * Fetches all articles from the API and updates the relevant atoms.
   * If the user is in admin mode, it also fetches draft articles.
   * Additionally, updates the tag list and retrieves the last updated articles.
   */
  const getArticles = async () => {
    try {
      const fetchedArticles = await articleApi.getArticles();
      let allArticles = fetchedArticles ?? [];
      if (adminMode) {
        const fetchedDraftArticles = await articleApi.getArticles({ draft: true });
        setDraftArticlesAtom(fetchedDraftArticles);
        allArticles = allArticles.concat(fetchedDraftArticles);
      } else {
        getLastUpdatedArticles(fetchedArticles);
      }
      setDisplayedArticles(allArticles);
      setDisplayedArticlesOnPage(allArticles.slice(0, itemsPerPage));
      setArticlesAtom(allArticles);
      getTags(allArticles);
    } catch (error: any) {
      const message = (await error.response.json()).message;
      setError(message);
    }
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };
  /**
   * Extracts unique tags from the provided articles and updates the tags atom.
   *
   * @param {ArticleMetadata[]} articles - The list of articles to extract tags from.
   */
  const getTags = (articles: ArticleMetadata[]) => {
    const allTags = articles.flatMap((article) => article.tags ?? []);
    const uniqueTags = [...new Set(allTags)];
    setTags(uniqueTags);
  };
  /**
   * Retrieves the most recently created, updated, and read articles from the provided list.
   * Updates the lastUpdatedArticles state with these selected articles.
   *
   * @param {ArticleMetadata[]} articles - The list of articles to process.
   */
  const getLastUpdatedArticles = (articles: ArticleMetadata[]) => {
    let lastCreatedArticleFound = false;
    let lastUpdatedArticleFound = false;
    let lastReadArticleFound = false;
    const lastUpdatedArticles = [];
    let i = 0;
    while (
      (!lastCreatedArticleFound || !lastUpdatedArticleFound || !lastReadArticleFound) &&
      i < articles.length
    ) {
      const lastUpdatedAt = articles[i].lastUpdatedAt?.getTime();
      const createdAt = articles[i].createdAt?.getTime();
      const lastReadAt = articles[i].lastReadAt?.getTime();
      if (!lastCreatedArticleFound && lastUpdatedAt === createdAt) {
        lastUpdatedArticles.push(articles[i]);
        lastCreatedArticleFound = true;
      } else if (!lastReadArticleFound && lastUpdatedAt === lastReadAt) {
        lastUpdatedArticles.push(articles[i]);
        lastReadArticleFound = true;
      } else if (!lastUpdatedArticleFound) {
        lastUpdatedArticles.push(articles[i]);
        lastUpdatedArticleFound = true;
      }
      i++;
    }
    setlastUpdatedArticles(lastUpdatedArticles);
  };
  /**
   * Deletes the specified article by its ID and updates the articles atom.
   *
   * @param {string | undefined} articleId - The ID of the article to delete.
   */
  const handleDelete = async (articleId?: string) => {
    if (!articleId) return;
    try {
      await articleApi.deleteArticle({ id: articleId });
      setArticlesAtom((articles) => (articles ?? []).filter((article) => article.id !== articleId));
    } catch (error: any) {
      const message = (await error.response.json()).message;
      setError(message);
    }
  };
  /**
   * Handles changes in the search input field.
   * Filters articles based on the search query and selected tags.
   *
   * @param {any} event - The input change event containing the search query.
   */
  const handleSearchInputChange = (event: any) => {
    const newSearchInput = event.target.value;
    setSearchInput(newSearchInput ?? "");

    if (!newSearchInput || newSearchInput === "") {
      setDisplayedArticles(
        adminMode && displayOption === "draft" ? draftArticles ?? [] : articles ?? []
      );
      return;
    }

    const filteredArticles = (
      adminMode && displayOption === "draft" ? draftArticles ?? [] : articles ?? []
    ).filter(
      (article) =>
        article.title.toLowerCase().includes(newSearchInput.toLowerCase()) &&
        selectedTags.every((tag) => article.tags?.includes(tag))
    );
    setDisplayedArticles(filteredArticles);
  };
  /**
   * Handles the selection of tags from the autocomplete component.
   * Filters the articles based on the selected tags and search input.
   *
   * @param {string[]} values - The array of selected tag strings.
   */
  const handleSelectedTagChange = (values: string[]) => {
    setSelectedTags(values);
    const filteredArticles = (
      adminMode && displayOption === "draft" ? draftArticles ?? [] : articles ?? []
    ).filter(
      (article) =>
        article.title.toLowerCase().includes(searchInput.toLowerCase()) &&
        values.every((tag) => article.tags?.includes(tag))
    );
    setDisplayedArticles(filteredArticles);
  };
  /**
   * Handles the change of the display option between all articles and draft articles.
   * Updates the displayed articles based on the selected option.
   *
   * @param {SelectChangeEvent<string>} event - The change event triggered by the select input.
   */
  const handleDisplayOptionChange = (event: SelectChangeEvent<string>) => {
    const newOption = event.target.value;
    setDisplayOption(newOption);
    switch (newOption) {
      case "all":
        setDisplayedArticles([...(articles ?? []), ...(draftArticles ?? [])]);
        break;
      case "approved":
        setDisplayedArticles((articles ?? []).filter((article) => !article.draft));
        break;
      case "draft":
        setDisplayedArticles(draftArticles ?? []);
        break;
      default:
        setDisplayedArticles(articles ?? []);
    }
    setPageNumber(1);
  };

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
  /**
   * Renders the search bar component with autocomplete and tag selection.
   * Allows filtering articles based on input text and selected tags.
   */
  const renderSearch = () => (
    <Card
      sx={{
        width: {
          lg: adminMode ? "55%" : "73%",
          md: adminMode ? "55%" : "calc(100% - 80px)",
          xs: adminMode ? "100%" : "calc(100% - 80px);"
        },
        boxShadow: 2,
        marginBottom: { xs: 2 }
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          backgroundColor: colors.button.main
        }}
      >
        <Autocomplete
          PopperComponent={CustomPopper}
          multiple
          disableCloseOnSelect
          id="checkboxes-tags-select-component"
          options={tags}
          sx={{ width: "100%" }}
          clearOnBlur={false}
          inputValue={searchInput}
          onInputChange={handleSearchInputChange}
          onChange={(_event, values) => {
            handleSelectedTagChange(values);
          }}
          size="small"
          renderOption={(props, option, { selected }) => (
            <li
              {...props}
              style={{ display: "flex", alignItems: "center" }}
              key={`tags-option-${option}`}
            >
              <Checkbox
                sx={{
                  color: colors.button.text,
                  marginRight: 2
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
        "&:hover": { backgroundColor: colors.button.hover }
      }}
    >
      <Typography variant={"body1"} marginLeft={1} sx={{ fontWeight: "bold" }}>
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
        "&:hover": { backgroundColor: colors.button.hover }
      }}
      size="small"
      onClick={() => setListView(!listView)}
    >
      {listView ? (
        <FormatListBulletedOutlinedIcon sx={{ color: colors.button.text }} />
      ) : (
        <GridViewIcon sx={{ color: colors.button.text }} />
      )}
    </Button>
  );

  const renderDropdownMenu = () => (
    <FormControl
      sx={{
        width: {
          md: "17%",
          sm: "40%",
          xs: "35%"
        },
        color: colors.button.text,
        "& fieldset": { border: "none" }
      }}
      size="medium"
    >
      <Select
        value={displayOption}
        onChange={handleDisplayOptionChange}
        displayEmpty
        inputProps={{ "aria-label": "Without label" }}
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
              backgroundColor: colors.button.main
            }
          }
        }}
      >
        <MenuItem
          sx={{
            textTransform: "uppercase",
            paddingLeft: 3,
            color: colors.button.text,
            backgroundColor: colors.button.main,
            "&:hover": {
              backgroundColor: colors.button.hover
            }
          }}
          value="all"
        >
          {strings.wikiDocumentation.allArticles}
        </MenuItem>
        <MenuItem
          sx={{
            textTransform: "uppercase",
            paddingLeft: 3,
            color: colors.button.text,
            backgroundColor: colors.button.main,
            "&:hover": {
              backgroundColor: colors.button.hover
            }
          }}
          value="approved"
        >
          {strings.wikiDocumentation.approvedArticles}
        </MenuItem>
        <MenuItem
          sx={{
            textTransform: "uppercase",
            paddingLeft: 3,
            color: colors.button.text,
            backgroundColor: colors.button.main,
            "&:hover": {
              backgroundColor: colors.button.hover
            }
          }}
          value="draft"
        >
          {strings.wikiDocumentation.draft}
        </MenuItem>
      </Select>
    </FormControl>
  );

  const renderTitle = (text: string) => (
    <Typography
      variant="h3"
      sx={{
        marginTop: 4,
        marginBottom: 1
      }}
    >
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

  if (loading) {
    return (
      <Card
        sx={{
          p: "25%",
          display: "flex",
          justifyContent: "center"
        }}
      >
        <CircularProgress sx={{ scale: "150%" }} />
      </Card>
    );
  }

  return (
    <>
      {formOpen ? (
        <CreateOrEditArticleForm setFormOpen={setFormOpen} action="create" adminMode={adminMode} />
      ) : (
        <>
          {!adminMode && (
            <>
              {renderTitle(strings.wikiDocumentation.cardTitle)}
              <CarouselArticleCards articles={lastUpdatedArticles} />
            </>
          )}
          <Box
            sx={
              adminMode
                ? { marginTop: 4, marginBottom: 4 }
                : { paddingLeft: 2, paddingRight: 2, marginBottom: 4 }
            }
          >
            {renderToolBar()}
            {displayedArticlesOnPage.length !== 0 ? (
              <Grid container spacing={adminMode ? 4 : 3} textAlign={"center"}>
                {displayedArticlesOnPage.map((article) => (
                  <Grid
                    item
                    lg={!listView ? 3 : 12}
                    md={!listView ? 4 : 12}
                    sm={!listView ? 6 : 12}
                    xs={12}
                    key={`article-grid-item-${article.id}`}
                  >
                    {listView ? (
                      <ArticleListItem
                        article={article}
                        adminMode={adminMode}
                        handleDelete={handleDelete}
                      />
                    ) : (
                      <ArticleCard
                        article={article}
                        adminMode={adminMode}
                        handleDelete={handleDelete}
                      />
                    )}
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Grid container justifyContent="center" sx={{ color: colors.button.text }}>
                <SearchOffIcon />
                <Typography variant="body1">{strings.wikiDocumentation.noArticlesFound}</Typography>
              </Grid>
            )}
          </Box>

          {displayedArticles.length > itemsPerPage && (
            <Grid container justifyContent="center" sx={{ marginBottom: 3 }}>
              <Pagination
                size="large"
                count={Math.floor(displayedArticles?.length / itemsPerPage) + 1}
                onChange={(_event, page) => setPageNumber(page)}
                page={pageNumber}
              />
            </Grid>
          )}
        </>
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        sx={{
          "& .MuiSnackbarContent-root": {
            minWidth: 400,
            minHeight: 100,
            fontSize: "1.5rem",
            borderRadius: "16px"
          }
        }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity="success"
          sx={{
            width: "100%",
            fontSize: "1.5rem",
            py: 3,
            px: 4,
            borderRadius: "14px"
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default WikiDocumentationScreen;
