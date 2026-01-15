import ClearIcon from "@mui/icons-material/Clear";
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
import { useAtomValue, useSetAtom } from "jotai";
import { type ChangeEvent, type KeyboardEvent, type SyntheticEvent, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { articleAtom, draftArticleAtom, tagsAtom } from "src/atoms/article";
import { userProfileAtom } from "src/atoms/auth";
import { errorAtom } from "src/atoms/error";
import { snackbarAtom } from "src/atoms/snackbar";
import { usersAtom } from "src/atoms/user";
import type { Article, User } from "src/generated/homeLambdasClient";
import { useLambdasApi } from "src/hooks/use-api";
import strings from "src/localization/strings";
import { uploadFile } from "src/utils/s3-file-utils";
import BackButton from "../generics/back-button";
import ActionButton from "./action-button";
import RichTextEditorLexical from "./rich-text-editor/rich-text-editor";

interface Props {
  handleClose: () => void;
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
 * @param action - "create" or "edit" mode (default: "create").
 * @param article - Article data for editing (optional).
 * @param setArticle - Updates article state externally.
 * @param adminMode - Enables admin-specific features (optional).
 */
const CreateOrEditArticleForm = ({
  handleClose,
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
  const navigate = useNavigate();
  const editorRef = useRef<EditorRef>(null);
  const [title, setTitle] = useState(article ? article.title : "");
  const [path, setPath] = useState(article ? article.path : "");
  const [coverImage, setCoverImage] = useState(article ? article.coverImage : "");
  const [description, setDescription] = useState(article ? article.description : "");
  const [imagePreview, setImagePreview] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(article ? article.tags || [] : []);
  const [tag, setTag] = useState("");
  const users = useAtomValue(usersAtom);
  const userProfile = useAtomValue(userProfileAtom);
  const loggedInUser = users.find((users: User) => users.id === userProfile?.id);
  const setSnackbar = useSetAtom(snackbarAtom);
  /**
   * Handles creating a new article using the editor content and form state.
   * Sends the article data to the API and updates local state accordingly.
   * Closes the form on success or sets an error message on failure.
   */
  const handleCreate = async () => {
    if (!editorRef.current) return;
    const content = editorRef.current?.getMarkdownContent();
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
      setSnackbar({
        open: true,
        message: messages[key],
        severity: "success"
      });

      handleClose();
    } catch (error: any) {
      const message = (await error.response.json()).message;
      setError(message);
    }
  };
  /**
   * Updates article atoms based on admin mode and draft status
   *
   * @param updatedArticle - The updated article data
   * @param response - The response article from the API
   */
  const updateArticleAtoms = (updatedArticle: Article, response: Article) => {
    if (!adminMode) {
      if (!updatedArticle.draft) {
        setArticlesAtom((articles) =>
          (articles || []).map((a) => (a.id === updatedArticle.id ? updatedArticle : a))
        );
      } else {
        setDraftArticlesAtom((articles) =>
          (articles || []).map((a) => (a.id === updatedArticle.id ? updatedArticle : a))
        );
      }
    } else {
      if (article?.draft) {
        setDraftArticlesAtom((articles) =>
          (articles || []).filter((article) => article.id !== response.id)
        );
      } else {
        setArticlesAtom((articles) =>
          (articles || []).filter((article) => article.id !== response.id)
        );
      }
      setArticlesAtom((articles) => [response, ...(articles || [])]);
      setTags((tags) => [...new Set<string>(tags.concat(selectedTags))]);
      if (setArticle) setArticle(updatedArticle);
    }
  };

  /**
   * Handles updating an existing article with current form and editor content.
   * Sends updated data to the API, updates local state, and manages tag sets.
   * Closes the form on success or sets an error message on failure.
   */
  const handleEdit = async () => {
    if (!editorRef.current || !article?.id) return;
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
      draft: !adminMode
    };

    try {
      const response = await articleApi.updateArticle({ article: updatedArticle, id: article.id });
      updateArticleAtoms(updatedArticle, response);

      const key = `edit-${adminMode ? "admin" : "user"}`;
      const messages: Record<string, string> = {
        "edit-admin": strings.snackbar.articleUpdated,
        "edit-user": strings.snackbar.changesSaved
      };
      setSnackbar({
        open: true,
        message: messages[key],
        severity: "success"
      });
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

  const handleTitleChange = (event: any) => {
    const newInput = event.target.value;
    setTitle(newInput);
    setPath(`${newInput.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9\-_]/g, "")}`);
  };

  const handlePathChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newInput = event.target.value;
    setPath(newInput);
  };

  const handleFileChange = async (event: any) => {
    const file = event.target.files[0];
    if (file.type?.includes("image/")) {
      const imageUrl = await uploadFile(file, articleApi);
      setCoverImage(imageUrl || "");
      setImagePreview(true);
    }
  };

  const handleDescriptionChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newInput = event.target.value;
    setDescription(newInput);
  };

  const handleTagChange = (_event: SyntheticEvent<Element, Event>, value: string) => setTag(value);

  const handleSelectedTagChange = (_event: SyntheticEvent<Element, Event>, value: string[]) =>
    setSelectedTags(value);

  const handleImageLinkChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newInput = event.target.value;
    setCoverImage(newInput);
  };

  const handleEnter = (event: KeyboardEvent<HTMLImageElement>) => {
    if (event.key !== "Enter") return;
    if (tag && !selectedTags.includes(tag)) setSelectedTags([...selectedTags, tag]);
    setTag("");
  };

  const CustomPopper = styled((props: PopperProps) => <Popper {...props} placement="bottom" />)({
    "& .MuiAutocomplete-paper": {
      marginTop: "10px"
    }
  });

  const isFormValid = Boolean(
    title.trim() &&
      path.trim() &&
      coverImage?.trim() &&
      description?.trim() &&
      editorRef.current?.getMarkdownContent()?.trim()
  );
  return (
    <>
      <Grid container spacing={1.5} sx={{ marginBottom: 3, marginTop: 0.5 }}>
        <Grid item xs={6}>
          <BackButton onClick={handleClose} styles={{ padding: "6px" }} />
        </Grid>
        <Grid item xs={6}>
          {action === "create" ? (
            <ActionButton onClick={handleCreate} disabled={!isFormValid}>
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
      <Card sx={{ padding: 2.5, overflow: "visible", marginBottom: 4 }}>
        <TextField
          sx={{ width: "100%" }}
          size="small"
          value={title}
          onChange={handleTitleChange}
          label={strings.wikiDocumentation.labelTitle}
          required
        />
        <Grid container spacing={1.5}>
          <Grid item md={6} xs={12}>
            <TextField
              sx={{ width: "100%", marginTop: 3 }}
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
              renderInput={(tag) => {
                return (
                  <TextField
                    {...tag}
                    sx={{ width: "100%", marginTop: 3 }}
                    size="small"
                    onKeyDown={handleEnter}
                    label={strings.wikiDocumentation.labelTags}
                  />
                );
              }}
              renderOption={(props, option, { selected }) => (
                <li
                  {...props}
                  style={{ display: "flex", alignItems: "center" }}
                  key={`tags-option-${option}`}
                >
                  <Checkbox
                    sx={{
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
            />
          </Grid>
        </Grid>
        <Grid container spacing={1.5}>
          <Grid item md={6} xs={12}>
            <TextField
              sx={{ width: "100%", marginTop: 3 }}
              size="small"
              value={coverImage}
              onInput={handleImageLinkChange}
              label={strings.wikiDocumentation.labelImage}
              required
            />
            {imagePreview && coverImage?.length !== 0 && (
              <Grid container>
                <img
                  style={{
                    height: "150px",
                    borderRadius: "15px",
                    marginTop: "16px",
                    marginLeft: 3
                  }}
                  src={coverImage}
                  alt="cover-image"
                />
                <Grid item sx={{ position: "relative" }}>
                  <IconButton
                    sx={{
                      position: "absolute",
                      top: "50%",
                      transform: "translateY(-50%)"
                    }}
                    onClick={() => {
                      setCoverImage("");
                      setImagePreview(false);
                    }}
                  >
                    <ClearIcon />
                  </IconButton>
                </Grid>
              </Grid>
            )}
            {!coverImage && (
              <Button
                variant="outlined"
                component="label"
                sx={{ marginTop: 1.5, marginBottom: 1, width: "100%" }}
              >
                {strings.wikiDocumentation.uploadImage}
                <input style={{ width: "100%" }} type="file" hidden onChange={handleFileChange} />
              </Button>
            )}
            {coverImage && !imagePreview && (
              <Button
                variant="outlined"
                sx={{ marginTop: 1, marginBottom: 1, width: "100%" }}
                onClick={() => setImagePreview(true)}
              >
                {strings.wikiDocumentation.imagePreview}
              </Button>
            )}
          </Grid>
          <Grid item md={6} xs={12}>
            <TextField
              sx={{ width: "100%", marginTop: 3 }}
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
        <RichTextEditorLexical
          ref={editorRef}
          markdownContent={article?.content || "Article content is required"}
        />
      </Card>
    </>
  );
};

export default CreateOrEditArticleForm;
