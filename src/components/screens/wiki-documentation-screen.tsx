import SearchOffIcon from "@mui/icons-material/SearchOff";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Pagination,
  type SelectChangeEvent,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme
} from "@mui/material";
import { useAtomValue, useSetAtom } from "jotai";
import { type MouseEvent, type SyntheticEvent, useEffect, useId, useState } from "react";
import addIcon from "../../../resources/img/wiki/add.svg";
import filterIcon from "../../../resources/img/wiki/filter.svg";
import gridIcon from "../../../resources/img/wiki/grid.svg";
import listIcon from "../../../resources/img/wiki/list.svg";
import searchIcon from "../../../resources/img/wiki/search.svg";
import { articleAtom, draftArticleAtom, tagsAtom } from "src/atoms/article";
import { errorAtom } from "src/atoms/error";
import type { ArticleMetadata } from "src/generated/homeLambdasClient";
import { useLambdasApi } from "src/hooks/use-api";
import { useSnackbar } from "src/hooks/use-snackbar";
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
import CreateOrEditArticleForm from "../wiki-documentation/create-article-form";

const WikiDocumentationScreen = () => {
  const { adminMode } = useUserRole();
  const itemsPerPage = adminMode ? 12 : 9;
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
  const lastUpdatedArticles = sortArticlesByDate(articles ?? []).slice(0, 2);
  const [filterAnchor, setFilterAnchor] = useState<HTMLElement | null>(null);
  const filterId = useId();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [displayOption, setDisplayOption] = useState("all");
  const [pageNumber, setPageNumber] = useState(1);
  const showSnackbar = useSnackbar();
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
        getTags(articles);
        setDisplayedArticles(articles);
      }
    }
  }, [articles, draftArticles, formOpen]);

  useEffect(() => {
    setDisplayedArticlesOnPage(
      displayedArticles.slice((pageNumber - 1) * itemsPerPage, itemsPerPage * pageNumber)
    );
  }, [pageNumber, displayedArticles, itemsPerPage]);

  /**
   * Fetches all articles from the API and updates the relevant atoms.
   * If the user is in admin mode, it also fetches draft articles.
   * Additionally, updates the tag list.
   */
  const getArticles = async () => {
    try {
      const fetchedArticles = await articleApi.getArticles();
      setArticlesAtom(fetchedArticles);

      if (adminMode) {
        const fetchedDraftArticles = await articleApi.getArticles({
          draft: true
        });
        setDraftArticlesAtom(fetchedDraftArticles);
        const allArticles = sortArticlesByDate([
          ...(fetchedArticles ?? []),
          ...(fetchedDraftArticles ?? [])
        ]);
        setDisplayedArticles(allArticles);
        setDisplayedArticlesOnPage(allArticles.slice(0, itemsPerPage));
        getTags(allArticles);
      } else {
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

  const getTags = (articles: ArticleMetadata[]) => {
    const allTags = articles.flatMap((article) => article.tags ?? []);
    const uniqueTags = [...new Set(allTags)];
    setTags(uniqueTags);
  };

  const handleDeleteDialogOpen = (
    articleId: string | undefined,
    articleTitle: string | undefined
  ) => {
    setSelectedArticleId(articleId);
    setDeleteTitle(articleTitle);
    setDeleteDialogOpen(true);
  };

  const getOnDeleteClick = (article: ArticleMetadata) =>
    article.id ? () => handleDeleteDialogOpen(article.id, article.title) : undefined;

  const handleConfirmDelete = () => {
    if (!selectedArticleId) return;
    handleDelete(selectedArticleId);
    setSelectedArticleId(undefined);
    setDeleteDialogOpen(false);
  };

  const handleDelete = async (selectedArticleId: string) => {
    if (!selectedArticleId) return;
    try {
      await articleApi.deleteArticle({ id: selectedArticleId });
      setArticlesAtom((articles) =>
        (articles ?? []).filter((article) => article.id !== selectedArticleId)
      );
      showSnackbar(strings.snackbar.articleDeleted);
    } catch (error: any) {
      const message = (await error.response.json()).message;
      setError(message);
    }
  };

  const handleSearchInputChange = (_event: SyntheticEvent, value: string) => {
    const newSearchInput = value;
    setSearchInput(newSearchInput ?? "");

    const articlesToFilter = getArticlesToFilter(
      adminMode,
      displayOption,
      articles ?? [],
      draftArticles ?? []
    );

    const filteredArticles = articlesToFilter.filter(
      (article) =>
        article.title.toLowerCase().includes(newSearchInput.toLowerCase().trim()) &&
        selectedTags.every((tag) => article.tags?.includes(tag))
    );
    setDisplayedArticles(filteredArticles);
    setPageNumber(1);
  };

  const handleSelectedTagChange = (tag: string) => {
    const nextTags = selectedTags.includes(tag)
      ? selectedTags.filter((value) => value !== tag)
      : [...selectedTags, tag];
    setSelectedTags(nextTags);
    const articlesToFilter = getArticlesToFilter(
      adminMode,
      displayOption,
      articles ?? [],
      draftArticles ?? []
    );
    const filteredArticles = articlesToFilter.filter(
      (article) =>
        article.title.toLowerCase().includes(searchInput.toLowerCase().trim()) &&
        nextTags.every((value) => article.tags?.includes(value))
    );
    setDisplayedArticles(filteredArticles);
    setPageNumber(1);
  };

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

  const renderEmployeeToolbar = () => (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: theme.spaces.m,
        mb: theme.spaces.xl
      }}
    >
      {/* biome-ignore lint/correctness/useUniqueElementIds: Wiki onboarding targets this ID */}
      <Button
        id="wiki-create-article-button"
        variant="contained"
        disableElevation
        onClick={() => setFormOpen(true)}
        sx={{
          gap: theme.spaces.xs,
          minHeight: 38,
          px: theme.spaces.m,
          py: theme.spaces.s,
          borderRadius: theme.radius.s,
          bgcolor: theme.palette.buttons.primary,
          color: "#222",
          fontSize: 14,
          fontWeight: 600,
          textTransform: "none",
          lineHeight: 1.6,
          "&:hover": { bgcolor: theme.palette.buttons.hover }
        }}
      >
        <img src={addIcon} alt="" />
        {strings.wikiDocumentation.createNew}
      </Button>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: theme.spaces.l
        }}
      >
        <SearchBar
          searchInput={searchInput}
          handleSearchInputChange={handleSearchInputChange}
          tags={tags}
          handleSelectedTagChange={handleSelectedTagChange}
          autoCompleteId={autoCompleteId}
          placeholder={strings.placeHolder.search}
          searchIcon={searchIcon}
          styles={{
            width: { xs: 180, sm: 240 },
            mb: 0,
            "& .MuiAutocomplete-inputRoot": {
              height: 36,
              p: "4px 8px",
              gap: "4px"
            },
            "& .MuiAutocomplete-input": { fontSize: 14 }
          }}
        />
        <IconButton
          aria-label={strings.wikiDocumentation.labelTags}
          aria-haspopup="menu"
          aria-controls={filterAnchor ? filterId : undefined}
          aria-expanded={Boolean(filterAnchor)}
          disabled={!tags.length}
          onClick={(event: MouseEvent<HTMLButtonElement>) => setFilterAnchor(event.currentTarget)}
          sx={{
            p: theme.spaces.s,
            borderRadius: theme.radius.s,
            bgcolor: selectedTags.length
              ? theme.palette.buttons.accent
              : theme.palette.buttons.secondaryBg,
            "&:hover": { bgcolor: theme.palette.buttons.secondaryHover }
          }}
        >
          <img src={filterIcon} alt="" />
        </IconButton>
        <Menu
          id={filterId}
          anchorEl={filterAnchor}
          open={Boolean(filterAnchor)}
          onClose={() => setFilterAnchor(null)}
        >
          {tags.map((tag) => (
            <MenuItem
              key={tag}
              role="menuitemcheckbox"
              aria-checked={selectedTags.includes(tag)}
              selected={selectedTags.includes(tag)}
              onClick={() => handleSelectedTagChange(tag)}
            >
              {tag}
            </MenuItem>
          ))}
        </Menu>
        <ToggleButtonGroup
          exclusive
          value={listView ? "list" : "grid"}
          onChange={(_event, view: "list" | "grid" | null) => {
            if (view) setListView(view === "list");
          }}
          sx={{
            bgcolor: theme.palette.buttons.secondaryBg,
            borderRadius: theme.radius.s,
            "& .MuiToggleButtonGroup-grouped": {
              p: theme.spaces.s,
              border: 0,
              borderRadius: theme.radius.s,
              m: 0,
              "&.Mui-selected": { bgcolor: theme.palette.buttons.accent },
              "&:hover, &.Mui-selected:hover": {
                bgcolor: theme.palette.buttons.secondaryHover
              }
            }
          }}
        >
          <ToggleButton value="list" aria-label={strings.wikiDocumentation.listView}>
            <img src={listIcon} alt="" />
          </ToggleButton>
          <ToggleButton value="grid" aria-label={strings.wikiDocumentation.gridView}>
            <img src={gridIcon} alt="" />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
    </Box>
  );

  const renderToolBar = () => (
    <Grid
      container
      sx={{
        justifyContent: "space-between",
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
            {
              value: "approved",
              label: strings.wikiDocumentation.approvedArticles
            },
            { value: "draft", label: strings.wikiDocumentation.draft }
          ]}
        />
      )}
      <ListViewButton listView={listView} setListView={setListView} />
      {/* biome-ignore lint/correctness/useUniqueElementIds: Wiki onboarding targets this ID */}
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
        // biome-ignore lint/correctness/useUniqueElementIds: Wiki onboarding targets this ID
        <Box
          id="wiki-card-title"
          sx={adminMode ? { width: "100%" } : { maxWidth: 1100, mx: "auto" }}
        >
          {!adminMode && (
            <>
              <Typography component="h1" variant="h1" align="center" sx={{ mb: theme.spaces.xxl }}>
                {strings.navigation.wiki}
              </Typography>
              {lastUpdatedArticles.length > 0 && (
                // biome-ignore lint/correctness/useUniqueElementIds: Wiki onboarding targets this ID
                <Box
                  component="section"
                  id="wiki-latest-updated-articles"
                  sx={{ mb: theme.spaces.xxxl }}
                >
                  <Typography component="h2" variant="h4" sx={{ mb: theme.spaces.l }}>
                    {strings.wikiDocumentation.lastUpdated}
                  </Typography>
                  <Grid container spacing={4}>
                    {lastUpdatedArticles.map((article) => (
                      <Grid key={article.id ?? article.path} size={{ xs: 12, md: 6 }}>
                        <ArticleCard article={article} adminMode={false} featured />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </>
          )}
          <Box sx={adminMode ? { marginTop: 4, marginBottom: 4 } : { marginBottom: 4 }}>
            {adminMode ? renderToolBar() : renderEmployeeToolbar()}
            {displayedArticlesOnPage.length !== 0 ? (
              // biome-ignore lint/correctness/useUniqueElementIds: Wiki onboarding targets this ID
              <Grid
                id="wiki-articles-list"
                container
                spacing={adminMode ? 4 : 3}
                sx={{
                  textAlign: "center"
                }}
              >
                {displayedArticlesOnPage.map((article) => (
                  <Grid
                    key={`article-grid-item-${article.id}`}
                    size={{
                      lg: listView ? 12 : adminMode ? 3 : 4,
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
              <Grid
                container
                sx={{
                  justifyContent: "center",
                  color: colors.button.text
                }}
              >
                <SearchOffIcon />
                <Typography variant="body1">{strings.wikiDocumentation.noArticlesFound}</Typography>
              </Grid>
            )}
          </Box>
          {displayedArticles.length > itemsPerPage && (
            <Grid
              container
              sx={{
                justifyContent: "center",
                marginBottom: 3
              }}
            >
              <Pagination
                size={adminMode ? "large" : "small"}
                count={Math.ceil(displayedArticles.length / itemsPerPage)}
                sx={
                  adminMode
                    ? undefined
                    : {
                        "& .MuiPaginationItem-root": { fontSize: 14 },
                        "& .MuiPaginationItem-root.Mui-selected": {
                          bgcolor: theme.palette.background.selected
                        }
                      }
                }
                onChange={(_event, page) => setPageNumber(page)}
                page={pageNumber}
              />
            </Grid>
          )}
          {adminMode && <BackButton styles={{ marginBottom: 2 }} />}
        </Box>
      )}
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
