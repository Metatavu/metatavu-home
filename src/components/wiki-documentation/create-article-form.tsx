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
import {
  type ChangeEvent,
  type KeyboardEvent,
  type SyntheticEvent,
  useRef,
  useState,
  useCallback
} from "react";
import RichTextEditorLexical from "./rich-text-editor/rich-text-editor";
import BackButton from "../generics/back-button";
import { uploadFile } from "src/utils/s3-file-utils";
import { useLambdasApi } from "src/hooks/use-api";
import ActionButton from "./action-button";
import { useAtomValue, useSetAtom } from "jotai";
import { articleAtom, draftArticleAtom, tagsAtom } from "src/atoms/article";
import { errorAtom } from "src/atoms/error";
import { usersAtom } from "src/atoms/user";
import { userProfileAtom } from "src/atoms/auth";
import ClearIcon from "@mui/icons-material/Clear";
import { snackbarAtom } from "src/atoms/snackbar";
import type { Article, User } from "src/generated/homeLambdasClient";

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
 * @param action - "create" or "edit" mode (default: "create").
 * @param article - Article data for editing (optional).
 * @param setArticle - Updates article state externally.
 * @param adminMode - Enables admin-specific features (optional).
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
  const users = useAtomValue(usersAtom);
  const userProfile = useAtomValue(userProfileAtom);
  const loggedInUser = users.find((u) => u.id === userProfile?.id);
  const setSnackbar = useSetAtom(snackbarAtom);

  const [title, setTitle] = useState(article?.title ?? "");
  const [path, setPath] = useState(article?.path ?? "");
  const [coverImage, setCoverImage] = useState(article?.coverImage ?? "");
  const [description, setDescription] = useState(article?.description ?? "");
  const [imagePreview, setImagePreview] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(article?.tags ?? []);
  const [tag, setTag] = useState("");

  const CustomPopper = styled((props: PopperProps) => <Popper {...props} placement="bottom" />)({
    "& .MuiAutocomplete-paper": { marginTop: "10px" }
  });

  /** Validates that a string is a proper URL */
  const isValidUrl = useCallback((value: string) => {
    try { new URL(value); return true; } 
    catch { return false; }
  }, []);

  /** Closes the form */
  const closeForm = useCallback(() => setFormOpen(false), [setFormOpen]);

  /** Updates title and generates path */
  const handleTitleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setPath(newTitle.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9\-_]/g, ""));
  }, []);

  const handlePathChange = useCallback((e: ChangeEvent<HTMLInputElement>) => setPath(e.target.value), []);
  const handleDescriptionChange = useCallback((e: ChangeEvent<HTMLInputElement>) => setDescription(e.target.value), []);
  const handleTagChange = useCallback((_e: SyntheticEvent, value: string) => setTag(value), []);
  const handleSelectedTagChange = useCallback((_e: SyntheticEvent, value: string[]) => setSelectedTags(value), []);

  /** Adds a new tag when pressing Enter */
  const handleEnter = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tag && !selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
      setTag("");
    }
  }, [tag, selectedTags]);

  /** Handles file uploads */
  const handleFileChange = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file?.type.includes("image/")) {
      const imageUrl = await uploadFile(file, articleApi);
      setCoverImage(imageUrl ?? "");
      setImagePreview(true);
    }
  }, [articleApi]);

  /** Updates cover image link */
  const handleImageLinkChange = useCallback((e: ChangeEvent<HTMLInputElement>) => setCoverImage(e.target.value), []);

  /** Shows a snackbar with the given key */
  const showSnackbar = useCallback((key: string) => {
    const messages: Record<string, string> = {
      "create-user": strings.snackbar.articleSubmitted,
      "create-admin": strings.snackbar.articleCreated,
      "edit-admin": strings.snackbar.articleUpdated,
      "edit-user": strings.snackbar.changesSaved
    };
    setSnackbar({ open: true, message: messages[key], severity: "success" });
  }, [setSnackbar]);

  /** Validates form before submit */
  const validateForm = useCallback(() => {
    if (!title.trim() || !path.trim() || !description.trim() || !editorRef.current?.getMarkdownContent()?.trim()) return false;
    if (!coverImage || !isValidUrl(coverImage)) return false;
    return true;
  }, [title, path, description, coverImage, isValidUrl]);

  /** Builds the article object for create */
  const buildNewArticle = useCallback(() => ({
    path,
    title,
    createdBy: `${loggedInUser?.firstName} ${loggedInUser?.lastName}`,
    content: editorRef.current?.getMarkdownContent(),
    tags: selectedTags,
    coverImage,
    description,
    draft: !adminMode
  }), [path, title, loggedInUser, selectedTags, coverImage, description, adminMode]);

  /** Builds the article object for edit */
  const buildUpdatedArticle = useCallback((): Article => ({
    path,
    title,
    content: editorRef.current?.getMarkdownContent() ?? "",
    tags: selectedTags,
    coverImage,
    description,
    createdBy: article?.createdBy ?? "",
    lastUpdatedBy: `${loggedInUser?.firstName} ${loggedInUser?.lastName}`,
    draft: !adminMode
  }), [path, title, selectedTags, coverImage, description, article, loggedInUser, adminMode]);

  /** Creates a new article */
  const handleCreate = useCallback(async () => {
    if (!editorRef.current || !validateForm()) return;
    try {
      const response = await articleApi.createArticle({ article: buildNewArticle() });
      if (!adminMode) {
        setDraftArticlesAtom((a) => [response, ...(a ?? [])]);
        setTags((t) => [...new Set([...t, ...selectedTags])]);
      } else setArticlesAtom((a) => [response, ...(a ?? [])]);
      showSnackbar(`create-${adminMode ? "admin" : "user"}`);
      closeForm();
    } catch (err: any) {
      const message = (await err.response.json()).message;
      setError(message);
    }
  }, [articleApi, buildNewArticle, adminMode, closeForm, selectedTags, setDraftArticlesAtom, setArticlesAtom, setTags, showSnackbar, setError, validateForm]);

  /** Edits an existing article */
  const handleEdit = useCallback(async () => {
    if (!editorRef.current || !article?.id || !validateForm()) return;
    const updatedArticle = buildUpdatedArticle();
    try {
      const response = await articleApi.updateArticle({ article: updatedArticle, id: article.id });
      if (!adminMode) {
        if (!updatedArticle.draft) setArticlesAtom((a) => (a ?? []).map((art) => art.id === updatedArticle.id ? updatedArticle : art));
        else setDraftArticlesAtom((a) => (a ?? []).map((art) => art.id === updatedArticle.id ? updatedArticle : art));
      } else {
        if (article.draft) setDraftArticlesAtom((a) => (a ?? []).filter((art) => art.id !== response.id));
        else setArticlesAtom((a) => (a ?? []).filter((art) => art.id !== response.id));
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
  }, [articleApi, article, adminMode, buildUpdatedArticle, closeForm, selectedTags, setDraftArticlesAtom, setArticlesAtom, setTags, setArticle, showSnackbar, setError, validateForm]);

  const isFormValid = validateForm();

  /** Renders cover image preview */
  const renderCoverImage = useCallback(() => {
    if (!imagePreview || !coverImage) return null;
    return (
      <Grid container>
        <img
          style={{ height: 150, borderRadius: 15, marginTop: 16, marginLeft: 3 }}
          src={coverImage}
          alt="cover-image"
        />
        <Grid item sx={{ position: "relative" }}>
          <IconButton
            sx={{ position: "absolute", top: "50%", transform: "translateY(-50%)" }}
            onClick={() => { setCoverImage(""); setImagePreview(false); }}
          >
            <ClearIcon />
          </IconButton>
        </Grid>
      </Grid>
    );
  }, [coverImage, imagePreview]);

  /** Renders tags autocomplete */
  const renderTagsAutocomplete = useCallback(() => (
    <Autocomplete
      multiple
      disableClearable
      freeSolo
      PopperComponent={CustomPopper}
      options={tags}
      inputValue={tag}
      value={selectedTags}
      onInputChange={handleTagChange}
      onChange={handleSelectedTagChange}
      renderInput={(params) => (
        <TextField {...params} sx={{ width: "100%", marginTop: 3 }} size="small" onKeyDown={handleEnter} label={strings.wikiDocumentation.labelTags} />
      )}
      renderOption={(props, option, { selected }) => (
        <li {...props} key={`tags-option-${option}`} style={{ display: "flex", alignItems: "center" }}>
          <Checkbox checked={selected} sx={{ marginRight: 2 }} />
          <Box component="span" sx={{ minWidth: "5px", marginRight: "10px", height: 40, borderRadius: 1 }} />
          {option}
        </li>
      )}
      sx={{ width: "100%" }}
    />
  ), [tags, tag, selectedTags, handleTagChange, handleSelectedTagChange, handleEnter, CustomPopper]);

  return (
    <>
      <Grid container spacing={1.5} sx={{ mb: 3, mt: 0.5 }}>
        <Grid item xs={6}>
          <BackButton onClick={closeForm} disableNavigation sx={{ padding: 6 }} />
        </Grid>
        <Grid item xs={6}>
          {action === "create" ? (
            <ActionButton onClick={handleCreate} disabled={!isFormValid}>{strings.wikiDocumentation.create}</ActionButton>
          ) : (
            <ActionButton onClick={handleEdit}>
              {adminMode && article?.draft ? strings.wikiDocumentation.confirm : strings.wikiDocumentation.save}
            </ActionButton>
          )}
        </Grid>
      </Grid>
      <Card sx={{ padding: 2.5, overflow: "visible", mb: 4 }}>
        <TextField sx={{ width: "100%" }} size="small" value={title} onChange={handleTitleChange} label={strings.wikiDocumentation.labelTitle} required />
        <Grid container spacing={1.5}>
          <Grid item md={6} xs={12}>
            <TextField sx={{ width: "100%", mt: 3 }} size="small" value={path} onChange={handlePathChange} label={strings.wikiDocumentation.labelPath} required />
          </Grid>
          <Grid item md={6} xs={12}>{renderTagsAutocomplete()}</Grid>
        </Grid>
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
            {renderCoverImage()}
            {!coverImage && (
              <Button variant="outlined" component="label" sx={{ mt: 1.5, mb: 1, width: "100%" }}>
                {strings.wikiDocumentation.uploadImage}
                <input type="file" hidden onChange={handleFileChange} />
              </Button>
            )}
            {coverImage && !imagePreview && (
              <Button variant="outlined" sx={{ mt: 1, mb: 1, width: "100%" }} onClick={() => setImagePreview(true)}>
                {strings.wikiDocumentation.imagePreview}
              </Button>
            )}
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
        <RichTextEditorLexical ref={editorRef} markdownContent={article?.content ?? "Article content is required"} />
      </Card>
    </>
  );
};

export default CreateOrEditArticleForm;
