/** biome-ignore-all lint/correctness/useUniqueElementIds: used for onboarding */

import {
  Box,
  Button,
  Chip,
  Collapse,
  Grid,
  IconButton,
  TextField,
  Typography,
  useTheme
} from "@mui/material";
import { useAtomValue, useSetAtom } from "jotai";
import { type ChangeEvent, type KeyboardEvent, type SyntheticEvent, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import addIcon from "../../../resources/img/wiki/editor/add.svg";
import coverAddIcon from "../../../resources/img/wiki/editor/cover-add.svg";
import removeCoverIcon from "../../../resources/img/wiki/editor/remove-cover.svg";
import removeTagIcon from "../../../resources/img/wiki/editor/remove-tag.svg";
import collapseIcon from "../../../resources/img/wiki/editor/collapse.svg";
import expandIcon from "../../../resources/img/wiki/editor/expand.svg";
import { articleAtom, draftArticleAtom, tagsAtom } from "src/atoms/article";
import { userProfileAtom } from "src/atoms/auth";
import { errorAtom } from "src/atoms/error";
import { usersAtom } from "src/atoms/user";
import type { Article, User } from "src/generated/homeLambdasClient";
import { useLambdasApi } from "src/hooks/use-api";
import { useSnackbar } from "src/hooks/use-snackbar";
import strings from "src/localization/strings";
import { OnboardingScreen } from "src/types/index";
import TagsAutocomplete from "../generics/tags-autocomplete";
import Onboarding from "../onboarding/Onboarding";
import CoverImageDialog from "./cover-image-dialog";
import RichTextEditorLexical from "./rich-text-editor/rich-text-editor";

const getCoverImageName = (image: string) => {
  try {
    const { pathname, hostname } = new URL(image);
    const name = pathname.split("/").filter(Boolean).pop();
    return name ? decodeURIComponent(name) : hostname;
  } catch {
    return image;
  }
};

interface Props {
  handleClose: () => void;
  adminMode: boolean;
  action: "edit" | "create";
  article?: Article;
  setArticle?: (value: Article) => void;
}

interface EditorRef {
  getMarkdownContent: () => string | undefined;
}
const CreateOrEditArticleForm = ({
  handleClose,
  action = "create",
  article,
  setArticle,
  adminMode
}: Props) => {
  const theme = useTheme();
  const [showTags, setShowTags] = useState(false);
  const [showCover, setShowCover] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(true);
  const [customPath, setCustomPath] = useState(action === "edit");
  const [hasContent, setHasContent] = useState(Boolean(article?.content?.trim()));
  const { articleApi } = useLambdasApi();
  const setError = useSetAtom(errorAtom);
  const setArticlesAtom = useSetAtom(articleAtom);
  const setDraftArticlesAtom = useSetAtom(draftArticleAtom);
  const setTags = useSetAtom(tagsAtom);
  const tags = useAtomValue(tagsAtom);
  const navigate = useNavigate();
  const editorRef = useRef<EditorRef>(null);
  const [title, setTitle] = useState(article ? article.title : "");
  const [path, setPath] = useState(article ? article.path : "");
  const [coverImage, setCoverImage] = useState(article ? article.coverImage : "");
  const [description, setDescription] = useState(article ? article.description : "");
  const [selectedTags, setSelectedTags] = useState<string[]>(article ? article.tags || [] : []);
  const [tag, setTag] = useState("");
  const users = useAtomValue(usersAtom);
  const userProfile = useAtomValue(userProfileAtom);
  const loggedInUser = users.find((users: User) => users.id === userProfile?.id);
  const showSnackbar = useSnackbar();

  const handleCreate = async () => {
    const content = editorRef.current?.getMarkdownContent();
    if (!isFormValid || !content?.trim()) return;
    const newArticle = {
      path: path,
      title: title,
      createdBy: loggedInUser?.id || "",
      content: content,
      tags: selectedTags,
      coverImage: coverImage,
      description: description,
      draft: !adminMode
    };
    try {
      const response = await articleApi.createArticle({ article: newArticle });
      if (!adminMode) {
        setDraftArticlesAtom((articles) => [response, ...(articles || [])]);
        setTags((tags) => [...new Set<string>(tags.concat(selectedTags))]);
      } else setArticlesAtom((articles) => [response, ...(articles || [])]);

      const key = `create-${adminMode ? "admin" : "user"}`;
      const messages: Record<string, string> = {
        "create-user": strings.snackbar.articleSubmitted,
        "create-admin": strings.snackbar.articleCreated
      };
      showSnackbar(messages[key]);

      handleClose();
    } catch (error: any) {
      const message = (await error.response.json()).message;
      setError(message);
    }
  };

  /**
   * Updates article atoms based on admin mode and draft status
   *
   * @param response - The response article from the API
   */
  const updateArticleAtoms = (response: Article) => {
    if (!article) return;

    if (article?.draft) {
      setDraftArticlesAtom((articles) => (articles || []).filter((a) => a.id !== article.id));
    } else {
      setArticlesAtom((articles) => (articles || []).filter((a) => a.id !== article.id));
    }
    if (response.draft) {
      setDraftArticlesAtom((articles) => [response, ...(articles || [])]);
    } else {
      setArticlesAtom((articles) => [response, ...(articles || [])]);
    }
    setTags((tags) => [...new Set(tags.concat(selectedTags))]);
    setArticle?.(response);
  };

  /**
   * Handles updating an existing article with current form and editor content.
   * Sends updated data to the API, updates local state, and manages tag sets.
   * Closes the form on success or sets an error message on failure.
   */
  const handleEdit = async () => {
    if (!adminMode || !editorRef.current || !article?.id) return;
    const content = editorRef.current?.getMarkdownContent();

    const updatedArticle: Article = {
      path: path,
      title: title,
      content: content || "",
      tags: selectedTags,
      coverImage: coverImage,
      description: description,
      createdBy: article.createdBy,
      lastUpdatedBy: loggedInUser?.id || "",
      draft: article.draft
    };

    try {
      const response = await articleApi.updateArticle({ article: updatedArticle, id: article.id });
      updateArticleAtoms(response);
      showSnackbar(strings.snackbar.articleUpdated);
      if (adminMode && action === "edit") {
        navigate("/admin/wiki-documentation");
      } else {
        handleClose();
      }
    } catch (error: any) {
      const message = (await error.response.json()).message;
      setError(message);
    }
  };

  const getDefaultPath = (value: string) =>
    value.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9\-_]/g, "");

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newInput = event.target.value;
    setTitle(newInput);
    if (!customPath) {
      setPath(getDefaultPath(newInput));
    }
  };

  const handlePathChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newInput = event.target.value;
    setCustomPath(Boolean(newInput.trim()));
    setPath(newInput || getDefaultPath(title));
  };

  const handleDescriptionChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newInput = event.target.value;
    setDescription(newInput);
  };

  const handleTagChange = (_event: SyntheticEvent<Element, Event>, value: string) => setTag(value);

  const handleSelectedTagChange = (_event: SyntheticEvent<Element, Event>, value: string[]) =>
    setSelectedTags(value);

  const handleEnter = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    if (tag && !selectedTags.includes(tag)) setSelectedTags([...selectedTags, tag]);
    setTag("");
  };

  const isFormValid = Boolean(
    title.trim() &&
      path.trim() &&
      coverImage?.trim() &&
      description?.trim() &&
      selectedTags.length &&
      hasContent
  );
  const labels = strings.wikiDocumentation;
  const fieldLabel = { fontWeight: 500, lineHeight: 1.6 };
  const fieldStyles = {
    "& .MuiOutlinedInput-root": { borderRadius: theme.radius.s, fontSize: 14 },
    "& .MuiOutlinedInput-notchedOutline": { borderColor: theme.palette.border.primary }
  };
  const buttonStyles = {
    borderRadius: theme.radius.s,
    px: theme.spaces.m,
    py: theme.spaces.s,
    gap: theme.spaces.xs,
    fontSize: 14,
    fontWeight: 600,
    lineHeight: 1.6,
    textTransform: "none",
    color: "#222",
    "&.Mui-disabled": { bgcolor: theme.palette.buttons.disabledBg }
  };
  const addButtonStyles = {
    ...buttonStyles,
    borderColor: theme.palette.buttons.primary,
    color: theme.palette.text.primary
  };

  return (
    <>
      <Onboarding screen={OnboardingScreen.WikiCreate} />
      <Box id="wiki-create-form-container" sx={{ maxWidth: 1100, mx: "auto", pb: theme.spaces.s }}>
        <Typography component="h1" variant="h2" sx={{ mb: theme.spaces.l }}>
          {action === "create" ? labels.createWikiTitle : labels.editWikiTitle}
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            flexWrap: "wrap",
            gap: theme.spaces.l,
            mb: theme.spaces.l
          }}
        >
          <Button
            onClick={handleClose}
            sx={{
              ...buttonStyles,
              bgcolor: theme.palette.buttons.secondaryBg,
              "&:hover": { bgcolor: theme.palette.buttons.secondaryHover }
            }}
          >
            {labels.cancel}
          </Button>
          <Button
            id="wiki-article-action-button"
            onClick={action === "create" ? handleCreate : handleEdit}
            disabled={action === "create" && !isFormValid}
            disableElevation
            variant="contained"
            sx={{
              ...buttonStyles,
              bgcolor: theme.palette.buttons.primary,
              "&:hover": { bgcolor: theme.palette.buttons.hover }
            }}
          >
            {action === "create"
              ? adminMode
                ? strings.form.create
                : labels.submitForReview
              : adminMode && article?.draft
                ? labels.confirm
                : labels.save}
          </Button>
        </Box>

        <Box sx={{ display: "grid", gap: theme.spaces.l }}>
          <Box>
            <Typography component="label" htmlFor="wiki-article-title-field" sx={fieldLabel}>
              {labels.labelTitle} *
            </Typography>
            <TextField
              id="wiki-article-title-field"
              value={title}
              onChange={handleTitleChange}
              placeholder={labels.titlePlaceholder}
              fullWidth
              size="small"
              required
              sx={{ ...fieldStyles, mt: theme.spaces.xs }}
            />
          </Box>
          <Box>
            <Typography component="label" htmlFor="wiki-article-description-field" sx={fieldLabel}>
              {labels.labelDescription} *
            </Typography>
            <TextField
              id="wiki-article-description-field"
              value={description}
              onChange={handleDescriptionChange}
              placeholder={labels.descriptionPlaceholder}
              fullWidth
              size="small"
              multiline
              rows={3}
              required
              sx={{ ...fieldStyles, mt: theme.spaces.xs }}
            />
          </Box>

          <Grid container columnSpacing={{ xs: 0, md: 12 }} rowSpacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 1
                }}
              >
                <Typography sx={{ ...fieldLabel, pt: theme.spaces.s }}>
                  {labels.labelTags} *
                </Typography>
                <Button
                  id="wiki-article-tags-field"
                  variant="outlined"
                  aria-expanded={showTags}
                  onClick={() => setShowTags(!showTags)}
                  sx={addButtonStyles}
                >
                  <img src={addIcon} alt="" />
                  {labels.addTags}
                </Button>
              </Box>
              {selectedTags.length > 0 && (
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: theme.spaces.s,
                    maxWidth: 262,
                    mt: theme.spaces.xs
                  }}
                >
                  {selectedTags.map((value) => (
                    <Chip
                      key={value}
                      label={value}
                      title={value}
                      onDelete={() =>
                        setSelectedTags((current) => current.filter((item) => item !== value))
                      }
                      deleteIcon={<img src={removeTagIcon} alt="" />}
                      sx={{
                        maxWidth: "100%",
                        height: 26,
                        borderRadius: theme.radius.m,
                        bgcolor: "#cce0e5",
                        color: theme.palette.text.accentSecondary,
                        fontSize: 14,
                        fontWeight: 500,
                        "& .MuiChip-label": { px: theme.spaces.s },
                        "& .MuiChip-deleteIcon": { m: 0, mr: theme.spaces.s, flexShrink: 0 }
                      }}
                    />
                  ))}
                </Box>
              )}
              {showTags && (
                <TagsAutocomplete
                  tags={tags}
                  tag={tag}
                  selectedTags={selectedTags}
                  handleTagChange={handleTagChange}
                  handleSelectedTagChange={handleSelectedTagChange}
                  handleEnter={handleEnter}
                  hideSelectedTags
                  size="small"
                  styles={{ ...fieldStyles, mt: theme.spaces.m }}
                />
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 1
                }}
              >
                <Typography sx={{ ...fieldLabel, pt: theme.spaces.s }}>
                  {labels.coverImageAlt} *
                </Typography>
                <Button
                  id="wiki-article-image-field"
                  variant="outlined"
                  aria-haspopup="dialog"
                  onClick={() => setShowCover(true)}
                  sx={addButtonStyles}
                >
                  <img src={coverAddIcon} alt="" />
                  {labels.addImage}
                </Button>
              </Box>
              {coverImage && (
                <Box sx={{ display: "flex", alignItems: "center", gap: theme.spaces.s }}>
                  <Typography noWrap title={coverImage} sx={{ fontSize: 14 }}>
                    {getCoverImageName(coverImage)}
                  </Typography>
                  <IconButton
                    aria-label={labels.removeCover}
                    onClick={() => setCoverImage("")}
                    size="small"
                    sx={{ p: theme.spaces.xs }}
                  >
                    <img src={removeCoverIcon} alt="" />
                  </IconButton>
                </Box>
              )}
            </Grid>
          </Grid>

          <Box>
            <Button
              aria-expanded={showAdvanced}
              aria-controls="wiki-advanced-options"
              onClick={() => setShowAdvanced(!showAdvanced)}
              sx={{ ...buttonStyles, px: 0, color: "text.primary", fontWeight: 500 }}
            >
              <img src={showAdvanced ? collapseIcon : expandIcon} alt="" />
              {strings.form.advancedOptions}
            </Button>
            <Collapse in={showAdvanced} id="wiki-advanced-options">
              <Box sx={{ mt: theme.spaces.m }}>
                <Typography component="label" htmlFor="wiki-article-path-field" sx={fieldLabel}>
                  {labels.labelPath}
                </Typography>
                <TextField
                  id="wiki-article-path-field"
                  value={customPath ? path : ""}
                  onChange={handlePathChange}
                  fullWidth
                  size="small"
                  sx={{ ...fieldStyles, mt: theme.spaces.xs }}
                />
              </Box>
            </Collapse>
          </Box>

          <Box id="wiki-article-content-editor" sx={{ mt: theme.spaces.m }}>
            <Typography id="wiki-article-content-label" sx={{ ...fieldLabel, mb: theme.spaces.m }}>
              {labels.articleContent} *
            </Typography>
            <RichTextEditorLexical
              ref={editorRef}
              markdownContent={article?.content ?? ""}
              onContentChange={setHasContent}
            />
          </Box>
        </Box>
      </Box>

      {showCover && (
        <CoverImageDialog
          currentImage={coverImage ?? ""}
          onClose={() => setShowCover(false)}
          onSave={(image) => {
            setCoverImage(image);
            setShowCover(false);
          }}
        />
      )}
    </>
  );
};

export default CreateOrEditArticleForm;
