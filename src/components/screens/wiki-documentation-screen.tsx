import SearchOffIcon from "@mui/icons-material/SearchOff";
import {
  Alert,
  Box,
  Card,
  CircularProgress,
  Grid,
  Pagination,
  type SelectChangeEvent,
  Snackbar,
  Typography,
  useTheme
} from "@mui/material";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useId, useState } from "react";
import { articleAtom, draftArticleAtom, tagsAtom } from "src/atoms/article";
import { errorAtom } from "src/atoms/error";
import { snackbarAtom } from "src/atoms/snackbar";
import type { ArticleMetadata } from "src/generated/homeLambdasClient";
import { useLambdasApi } from "src/hooks/use-api";
import useUserRole from "src/hooks/use-user-role";
import strings from "src/localization/strings";
import { wikiScreenColors } from "src/theme";
import { DeleteItemType, OnboardingScreen } from "src/types/index";
import { getArticlesToFilter, sortArticlesByDate } from "src/utils/wiki-utils";
import DeleteConfirmationDialog from "../contexts/delete-confirmation-dialog";
import BackButton from "../generics/back-button";
import CreateButton from "../generics/create-button";
import Dropdown from "../generics/dropdown";
import ListViewButton from "../generics/list-view-button";
import SearchBar from "../generics/search-bar";
import Onboarding from "../onboarding/Onboarding";
import ArticleCard from "../wiki-documentation/article-card";
import ArticleListItem from "../wiki-documentation/article-list-item";
import CarouselArticleCards from "../wiki-documentation/carousel-article-cards";
import CreateOrEditArticleForm from "../wiki-documentation/create-article-form";

const itemsPerPage = 12;

/**
 * Wiki documentation screen component displaying a list of articles.
 */
const WikiDocumentationScreen = () => {
  const { adminMode } = useUserRole();
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const autoCompleteId = useId();
  const [selectedArticleId, setSelectedArticleId] = useState<string | undefined>(undefined);
  const [deleteTitle, setDeleteTitle] = useState<string | undefined>(undefined);
  const theme = useTheme();
  const colors = wikiScreenColors(theme);

  useEffect(() => {
    if (!articles) getArticles();
    else if (articles.length !== 0) {
      if (adminMode) {
        const allArticles = [...articles, ...(draftArticles ?? [])];
        getTags(allArticles);
        if (displayOption === "all") {
          setDisplayedArticles(sortArticlesByDate(allArticles));
        } else if (displayOption === "approved") {
          setDisplayedArticles(articles.filter((article) => !article.draft));
        } else if (displayOption === "draft") {
          setDisplayedArticles(draftArticles ?? []);
        }
      } else {
        getLastUpdatedArticles(articles);
        getTags(articles);
        setDisplayedArticles(articles);
      }
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
      setArticlesAtom(fetchedArticles);

      if (adminMode) {
        const fetchedDraftArticles = await articleApi.getArticles({ draft: true });
        setDraftArticlesAtom(fetchedDraftArticles);
        const allArticles = sortArticlesByDate([
          ...(fetchedArticles ?? []),
          ...(fetchedDraftArticles ?? [])
        ]);
        setDisplayedArticles(allArticles);
        setDisplayedArticlesOnPage(allArticles.slice(0, itemsPerPage));
        getTags(allArticles);
      } else {
        getLastUpdatedArticles(fetchedArticles);
        setDisplayedArticles(fetchedArticles ?? []);
        setDisplayedArticlesOnPage((fetchedArticles ?? []).slice(0, itemsPerPage));
        getTags(fetchedArticles ?? []);
      }
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
   * Opens the delete confirmation dialog.
   *
   * @param {string | undefined} articleId - The ID of the article to be deleted.
   * @param {string | undefined} articleTitle - The title of the article to be deleted.
   */
  const handleDeleteDialogOpen = (
    articleId: string | undefined,
    articleTitle: string | undefined
  ) => {
    setSelectedArticleId(articleId);
    setDeleteTitle(articleTitle);
    setDeleteDialogOpen(true);
  };

  /**
   * Returns a function that opens the delete confirmation dialog for the specified article.
   *
   * @param {ArticleMetadata} article - The article for which to get the delete click handler.
   * @returns A function that opens the delete confirmation dialog when called.
   */
  const getOnDeleteClick = (article: ArticleMetadata) =>
    article.id ? () => handleDeleteDialogOpen(article.id, article.title) : undefined;

  /**
   * Handles the confirmation of article deletion.
   */
  const handleConfirmDelete = () => {
    if (!selectedArticleId) return;
    handleDelete(selectedArticleId);
    setSelectedArticleId(undefined);
    setDeleteDialogOpen(false);
  };

  /**
   * Deletes the specified article by its ID and updates the articles atom.
   *
   * @param {string} selectedArticleId - The ID of the article to delete.
   */
  const handleDelete = async (selectedArticleId: string) => {
    if (!selectedArticleId) return;
    try {
      await articleApi.deleteArticle({ id: selectedArticleId });
      setArticlesAtom((articles) =>
        (articles ?? []).filter((article) => article.id !== selectedArticleId)
      );
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

    const articlesToFilter = getArticlesToFilter(
      adminMode,
      displayOption,
      articles ?? [],
      draftArticles ?? []
    );

    if (!newSearchInput || newSearchInput === "") {
      setDisplayedArticles(articlesToFilter);
      return;
    }

    const filteredArticles = articlesToFilter.filter(
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
    const articlesToFilter = getArticlesToFilter(
      adminMode,
      displayOption,
      articles ?? [],
      draftArticles ?? []
    );
    const filteredArticles = articlesToFilter.filter(
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
      case "all": {
        const allArticles = sortArticlesByDate([...(articles ?? []), ...(draftArticles ?? [])]);
        setDisplayedArticles(allArticles);
        break;
      }
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
      <SearchBar
        searchInput={searchInput}
        handleSearchInputChange={handleSearchInputChange}
        tags={tags}
        handleSelectedTagChange={handleSelectedTagChange}
        autoCompleteId={autoCompleteId}
        styles={
          adminMode
            ? {
                width: { lg: "55%", md: "55%", xs: "100%" }
              }
            : undefined
        }
        placeholder={strings.wikiDocumentation.searchArticle}
      />
      {adminMode && (
        <Dropdown
          displayOption={displayOption}
          handleDisplayOptionChange={handleDisplayOptionChange}
          displayOptions={[
            { value: "all", label: strings.wikiDocumentation.allArticles },
            { value: "approved", label: strings.wikiDocumentation.approvedArticles },
            { value: "draft", label: strings.wikiDocumentation.draft }
          ]}
        />
      )}
      <ListViewButton listView={listView} setListView={setListView} />
      {/* biome-ignore lint/correctness/useUniqueElementIds: keeping static id */}
      <CreateButton id="wiki-create-article-button" onClick={() => setFormOpen(true)} />
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
      <Onboarding screen={OnboardingScreen.Wiki} />
      {formOpen ? (
        <CreateOrEditArticleForm
          handleClose={() => setFormOpen(false)}
          action="create"
          adminMode={adminMode}
        />
      ) : (
        // biome-ignore lint/correctness/useUniqueElementIds: keeping static id
        <Box id="wiki-card-title" sx={{ width: "100%" }}>
          {!adminMode && (
            <>
              {renderTitle(strings.wikiDocumentation.cardTitle)}
              {/* biome-ignore lint/correctness/useUniqueElementIds: keeping static id */}
              <Box id="wiki-latest-updated-articles">
                <CarouselArticleCards articles={lastUpdatedArticles} />
              </Box>
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
              // biome-ignore lint/correctness/useUniqueElementIds: keeping static id
              <Grid
                id="wiki-articles-list"
                container
                spacing={adminMode ? 4 : 3}
                textAlign={"center"}
              >
                {displayedArticlesOnPage.map((article) => (
                  <Grid
                    key={`article-grid-item-${article.id}`}
                    size={{
                      lg: listView ? 12 : 3,
                      md: listView ? 12 : 4,
                      sm: listView ? 12 : 6,
                      xs: 12
                    }}
                  >
                    {listView ? (
                      <ArticleListItem
                        article={article}
                        adminMode={adminMode}
                        onDeleteClick={getOnDeleteClick(article)}
                      />
                    ) : (
                      <ArticleCard
                        article={article}
                        adminMode={adminMode}
                        onDeleteClick={getOnDeleteClick(article)}
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
          <BackButton styles={{ marginBottom: 2 }} />
        </Box>
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
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        setOpen={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        deleteType={DeleteItemType.ARTICLE}
        deleteTitle={deleteTitle}
      />
    </>
  );
};

export default WikiDocumentationScreen;
