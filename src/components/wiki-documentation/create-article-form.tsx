import {
  Autocomplete,
  Box,
  Button,
  Card,
  Checkbox,
  Grid,
  IconButton,
  Popper,
  type PopperProps,
  styled,
  TextField
} from "@mui/material";
import strings from "src/localization/strings";
import { type ChangeEvent, type KeyboardEvent, type SyntheticEvent, useRef, useState, useCallback } from "react";
import RichTextEditorLexical from "./rich-text-editor/rich-text-editor";
import BackButton from "../generics/back-button";
import { uploadFile } from "src/utils/s3-file-utils";
import { useLambdasApi } from "src/hooks/use-api";
import ActionButton from "./action-button";
import { useAtomValue, useSetAtom } from "jotai";
import { articleAtom, draftArticleAtom, tagsAtom } from "src/atoms/article";
import { errorAtom } from "src/atoms/error";
import type { Article, User } from "src/generated/homeLambdasClient";
import { usersAtom } from "src/atoms/user";
import { userProfileAtom } from "src/atoms/auth";
import ClearIcon from "@mui/icons-material/Clear";
import { snackbarAtom } from "src/atoms/snackbar";

interface Props {
  setFormOpen: (value: boolean) => void;
  adminMode: boolean;
  action: "edit" | "create";
  article?: Article;
  setArticle?: (value: Article) => void;
}

interface EditorRef {
  getMarkdownContent: () => string;
}

/**
 * Form for creating or editing an article.
 *
 * @param setFormOpen - Controls form visibility.
 * @param action - "create" or "edit" mode.
 * @param article - Article data for editing (optional).
 * @param setArticle - Updates article state externally.
 * @param adminMode - Enables admin-specific features.
 */
const CreateOrEditArticleForm = ({
  setFormOpen,
  action = "create",
  article,
  setArticle,
  adminMode
}: Props) => {
  const { articleApi } = useLambdasApi();
  const setError = useSetAtom(errorAtom);
  const setArticlesAtom = useSetAtom(articleAtom);
  const setDraftArticlesAtom = useSetAtom(draftArticleAtom);
  const setTags = useSetAtom(tagsAtom);
  const tags = useAtomValue(tagsAtom);
  const editorRef = useRef<EditorRef>(null);

  const [title, setTitle] = useState(article?.title ?? "");
  const [path, setPath] = useState(article?.path ?? "");
  const [coverImage, setCoverImage] = useState(article?.coverImage ?? "");
  const [description, setDescription] = useState(article?.description ?? "");
  const [imagePreview, setImagePreview] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(article?.tags ?? []);
  const [tag, setTag] = useState("");

  const users = useAtomValue(usersAtom);
  const userProfile = useAtomValue(userProfileAtom);
  const loggedInUser = users.find((u) => u.id === userProfile?.id);
  const setSnackbar = useSetAtom(snackbarAtom);

  const CustomPopper = styled((props: PopperProps) => <Popper {...props} placement="bottom" />)({
    "& .MuiAutocomplete-paper": { marginTop: "10px" }
  });

  /** Checks that a URL is valid */
  const isValidUrl = useCallback((value: string) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }, []);

  /** Builds a new Article object from form state */
  const buildNewArticle = useCallback(() => ({
    path,
    title,
    createdBy: `${loggedInUser?.firstName ?? ""} ${loggedInUser?.lastName ?? ""}`,
    content: editorRef.current?.getMarkdownContent() ?? "",
    tags: selectedTags,
    coverImage,
    description,
    draft: !adminMode
  }), [title, path, coverImage, description, selectedTags, loggedInUser, adminMode]);

  /** Builds an updated Article object from form state */
  const buildUpdatedArticle = useCallback((): Article => ({
    path,
    title,
    content: editorRef.current?.getMarkdownContent() ?? "",
    tags: selectedTags,
    coverImage,
    description,
    createdBy: article?.createdBy ?? "",
    lastUpdatedBy: `${loggedInUser?.firstName ?? ""} ${loggedInUser?.lastName ?? ""}`,
    draft: !adminMode,
    id: article?.id ?? ""
  }), [title, path, coverImage, description, selectedTags, loggedInUser, adminMode, article?.createdBy, article?.id]);

  /** Validates form fields */
  const validateForm = useCallback(() => {
    return Boolean(
      title.trim() &&
      path.trim() &&
      coverImage.trim() &&
      description.trim() &&
      editorRef.current?.getMarkdownContent()?.trim() &&
      isValidUrl(coverImage)
    );
  }, [title, path, coverImage, description, isValidUrl]);

  /** Displays a success snackbar */
  const showSnackbar = useCallback((key: string) => {
    const messages: Record<string, string> = {
      "create-user": strings.snackbar.articleSubmitted,
      "create-admin": strings.snackbar.articleCreated,
      "edit-admin": strings.snackbar.articleUpdated,
      "edit-user": strings.snackbar.changesSaved
    };
    setSnackbar({ open: true, message: messages[key], severity: "success" });
  }, [setSnackbar]);

  /** Closes the form */
  const closeForm = useCallback(() => setFormOpen(false), [setFormOpen]);

  /** Updates title and automatically sets path */
  const handleTitleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setPath(newTitle.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9\-_]/g, ""));
  }, []);

  /** Handlers for other input fields */
  const handlePathChange = useCallback((e: ChangeEvent<HTMLInputElement>) => setPath(e.target.value), []);
  const handleDescriptionChange = useCallback((e: ChangeEvent<HTMLInputElement>) => setDescription(e.target.value), []);
  const handleImageLinkChange = useCallback((e: ChangeEvent<HTMLInputElement>) => setCoverImage(e.target.value), []);
  const handleTagChange = useCallback((_e: SyntheticEvent, value: string) => setTag(value), []);
  const handleSelectedTagChange = useCallback((_e: SyntheticEvent, value: string[]) => setSelectedTags(value), []);

  /** Handles Enter key for adding new tags */
  const handleEnter = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tag && !selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
      setTag("");
    }
  }, [tag, selectedTags]);

  /** Handles image file uploads */
  const handleFileChange = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file?.type.includes("image/")) {
      const imageUrl = await uploadFile(file, articleApi);
      setCoverImage(imageUrl ?? "");
      setImagePreview(true);
    }
  }, [articleApi]);

  /** Creates a new article */
  const handleCreate = useCallback(async () => {
    if (!editorRef.current || !validateForm()) return;
    try {
      const newArticle = buildNewArticle();
      const response = await articleApi.createArticle({ article: newArticle });
      if (adminMode) setArticlesAtom((a) => [response, ...(a ?? [])]);
      else {
        setDraftArticlesAtom((a) => [response, ...(a ?? [])]);
        setTags((t) => [...new Set([...t, ...selectedTags])]);
      }
      showSnackbar(`create-${adminMode ? "admin" : "user"}`);
      closeForm();
    } catch (err: any) {
      const message = (await err.response.json()).message;
      setError(message);
    }
  }, [articleApi, adminMode, buildNewArticle, closeForm, selectedTags, setArticlesAtom, setDraftArticlesAtom, setTags, showSnackbar, setError, validateForm]);

  /** Edits an existing article */
  const handleEdit = useCallback(async () => {
    if (!editorRef.current || !article?.id || !validateForm()) return;
    const updatedArticle = buildUpdatedArticle();

    const updateAtom = (atomSetter: typeof setArticlesAtom | typeof setDraftArticlesAtom) => {
      atomSetter((a) => (a ?? []).map((art) => art.id === updatedArticle.id ? updatedArticle : art));
    };
    const removeFromAtom = (atomSetter: typeof setArticlesAtom | typeof setDraftArticlesAtom) => {
      atomSetter((a) => (a ?? []).filter((art) => art.id !== updatedArticle.id));
    };

    try {
      const response = await articleApi.updateArticle({ article: updatedArticle, id: article.id });

      if (!adminMode) {
        if (!updatedArticle.draft) updateAtom(setArticlesAtom);
        else updateAtom(setDraftArticlesAtom);
      } else {
        if (article.draft) removeFromAtom(setDraftArticlesAtom);
        else removeFromAtom(setArticlesAtom);
        setArticlesAtom((a) => [response, ...(a ?? [])]);
        setTags((t) => [...new Set([...t, ...selectedTags])]);
        setArticle?.(updatedArticle);
      }

      showSnackbar(`edit-${adminMode ? "admin" : "user"}`);
      closeForm();
    } catch (err: any) {
      const message = (await err.response.json()).message;
      setError(message);
    }
  }, [
    articleApi,
    article,
    adminMode,
    buildUpdatedArticle,
    closeForm,
    selectedTags,
    setDraftArticlesAtom,
    setArticlesAtom,
    setTags,
    setArticle,
    showSnackbar,
    setError,
    validateForm
  ]);

  return (
    <>
      {/* Back and Action buttons */}
      <Grid container spacing={1.5} sx={{ mb: 3, mt: 0.5 }}>
        <Grid item xs={6}>
          <BackButton onClick={closeForm} disableNavigation sx={{ padding: "6px" }} />
        </Grid>
        <Grid item xs={6}>
          {action === "create" ? (
            <ActionButton onClick={handleCreate} disabled={!validateForm()}>
              {strings.wikiDocumentation.create}
            </ActionButton>
          ) : (
            <ActionButton onClick={handleEdit}>
              {adminMode && article?.draft
                ? strings.wikiDocumentation.confirm
                : strings.wikiDocumentation.save}
            </ActionButton>
          )}
        </Grid>
      </Grid>

      {/* Article Form */}
      <Card sx={{ p: 2.5, overflow: "visible", mb: 4 }}>
        <TextField
          sx={{ width: "100%" }}
          size="small"
          value={title}
          onChange={handleTitleChange}
          label={strings.wikiDocumentation.labelTitle}
          required
        />

        {/* Path and Tags */}
        <Grid container spacing={1.5}>
          <Grid item md={6} xs={12}>
            <TextField
              sx={{ width: "100%", mt: 3 }}
              size="small"
              value={path}
              onChange={handlePathChange}
              label={strings.wikiDocumentation.labelPath}
              required
            />
          </Grid>
          <Grid item md={6} xs={12}>
            <Autocomplete
              multiple
              disableClearable
              freeSolo
              PopperComponent={CustomPopper}
              options={tags}
              sx={{ width: "100%" }}
              inputValue={tag}
              size="small"
              value={selectedTags}
              onInputChange={handleTagChange}
              onChange={handleSelectedTagChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  sx={{ width: "100%", mt: 3 }}
                  size="small"
                  onKeyDown={handleEnter}
                  label={strings.wikiDocumentation.labelTags}
                />
              )}
              renderOption={(props, option, { selected }) => (
                <li {...props} key={`tags-option-${option}`} style={{ display: "flex", alignItems: "center" }}>
                  <Checkbox sx={{ mr: 2 }} checked={selected} />
                  <Box sx={{ mr: 1, minWidth: "5px", height: 40, borderRadius: "5px" }} />
                  {option}
                </li>
              )}
            />
          </Grid>
        </Grid>

        {/* Cover Image and Description */}
        <Grid container spacing={1.5}>
          <Grid item md={6} xs={12}>
            <TextField
              sx={{ width: "100%", mt: 3 }}
              size="small"
              value={coverImage}
              onInput={handleImageLinkChange}
              label={strings.wikiDocumentation.labelImage}
              required
              error={Boolean(coverImage && !isValidUrl(coverImage))}
              helperText={coverImage && !isValidUrl(coverImage) ? strings.wikiDocumentation.URLFalse : ""}
            />
            {coverImage && imagePreview && (
              <Grid container position="relative">
                <img
                  src={coverImage}
                  alt="cover-image"
                  style={{ height: "150px", borderRadius: "15px", marginTop: "16px", marginLeft: 3 }}
                />
                <IconButton
                  sx={{ position: "absolute", top: "50%", transform: "translateY(-50%)" }}
                  onClick={() => {
                    setCoverImage("");
                    setImagePreview(false);
                  }}
                >
                  <ClearIcon />
                </IconButton>
              </Grid>
            )}
            {!coverImage ? (
              <Button variant="outlined" component="label" sx={{ mt: 1.5, mb: 1, width: "100%" }}>
                {strings.wikiDocumentation.uploadImage}
                <input type="file" hidden onChange={handleFileChange} />
              </Button>
            ) : !imagePreview ? (
              <Button variant="outlined" sx={{ mt: 1, mb: 1, width: "100%" }} onClick={() => setImagePreview(true)}>
                {strings.wikiDocumentation.imagePreview}
              </Button>
            ) : null}
          </Grid>

          <Grid item md={6} xs={12}>
            <TextField
              sx={{ width: "100%", mt: 3 }}
              size="small"
              multiline
              rows={3}
              value={description}
              onInput={handleDescriptionChange}
              label={strings.wikiDocumentation.labelDescription}
              required
            />
          </Grid>
        </Grid>

        {/* Rich Text Editor */}
        <RichTextEditorLexical
          ref={editorRef}
          markdownContent={article?.content ?? "Article content is required"}
        />
      </Card>
    </>
  );
};

export default CreateOrEditArticleForm;
