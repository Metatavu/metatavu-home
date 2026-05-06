/** biome-ignore-all lint/correctness/useUniqueElementIds: used for onboarding */

import ClearIcon from "@mui/icons-material/Clear";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import ImageIcon from "@mui/icons-material/Image";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField
} from "@mui/material";
import { useAtomValue, useSetAtom } from "jotai";
import { type ChangeEvent, type KeyboardEvent, type SyntheticEvent, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { articleAtom, draftArticleAtom, tagsAtom } from "src/atoms/article";
import { userProfileAtom } from "src/atoms/auth";
import { errorAtom } from "src/atoms/error";
import { usersAtom } from "src/atoms/user";
import type { Article, User } from "src/generated/homeLambdasClient";
import { useLambdasApi } from "src/hooks/use-api";
import { useSnackbar } from "src/hooks/use-snackbar";
import strings from "src/localization/strings";
import { OnboardingScreen } from "src/types/index";
import {
  getHttpsUrlFromS3,
  importPlaybook,
  listMediaFiles,
  uploadFile
} from "src/utils/s3-file-utils";
import BackButton from "../generics/back-button";
import TagsAutocomplete from "../generics/tags-autocomplete";
import Onboarding from "../onboarding/Onboarding";
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
  const [mediaFiles, setMediaFiles] = useState<string[]>([]);
  const [showMediaSelector, setShowMediaSelector] = useState(false);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const users = useAtomValue(usersAtom);
  const userProfile = useAtomValue(userProfileAtom);
  const loggedInUser = users.find((users: User) => users.id === userProfile?.id);
  const showSnackbar = useSnackbar();

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

  const handleTitleChange = (event: any) => {
    const newInput = event.target.value;
    setTitle(newInput);
    if (action === "create") {
      setPath(`${newInput.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9\-_]/g, "")}`);
    }
  };

  const handlePathChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newInput = event.target.value;
    setPath(newInput);
  };

  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const handleFileChange = async (event: any) => {
    const file = event.target.files[0];
    if (file.type?.includes("image/")) {
      setIsUploadingCover(true);
      try {
        const imageUrl = await uploadFile(file, articleApi);
        setCoverImage(imageUrl || "");
        setImagePreview(true);
      } finally {
        setIsUploadingCover(false);
      }
    }
  };

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setIsUploadingCover(true);
    try {
      const { articlePath } = await importPlaybook(file, title, articleApi);
      navigate(`/wiki${articlePath.replace(/^\/wiki/, "")}`);
    } catch (error) {
      console.error("Error importing playbook:", error);
    } finally {
      setIsUploadingCover(false);
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

  /**
   * Opens the media selector dialog and fetches the list of available media files from S3.
   * Shows a snackbar error if the files fail to load.
   */
  const handleOpenMediaSelector = async () => {
    setShowMediaSelector(true);
    setLoadingMedia(true);
    try {
      const files = await listMediaFiles(articleApi);
      setMediaFiles(files || []);
    } catch (error) {
      console.error(strings.wikiDocumentation.errorLoadingMediaFiles, error);
    } finally {
      setLoadingMedia(false);
    }
  };

  /**
   * Handles selecting a media file from the S3 media selector dialog.
   * Converts the S3 file name to an HTTPS URL, sets it as the cover image,
   * enables the image preview, and closes the media selector dialog.
   *
   * @param fileName - The S3 file name of the selected media file.
   */
  const handleSelectMediaFile = (fileName: string) => {
    const httpsUrl = getHttpsUrlFromS3(fileName);
    setCoverImage(httpsUrl);
    setImagePreview(true);
    setShowMediaSelector(false);
  };

  /**
   * Renders the content of the media file selector dialog.
   * Shows a loading spinner while files are being fetched,
   * a "no files found" message if the list is empty,
   * or a list of selectable media files.
   */
  const renderMediaFiles = () => {
    if (loadingMedia) {
      return (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      );
    }

    if (mediaFiles.length === 0) {
      return (
        <List>
          <ListItem>
            <ListItemText primary={strings.wikiDocumentation.noFilesFound} />
          </ListItem>
        </List>
      );
    }

    return (
      <List>
        {mediaFiles.map((fileName) => (
          <ListItem key={fileName} disablePadding>
            <ListItemButton onClick={() => handleSelectMediaFile(fileName)}>
              <ImageIcon sx={{ mr: 2 }} />
              <ListItemText primary={fileName} secondary={getHttpsUrlFromS3(fileName)} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    );
  };
  /**
   * Handles the "Enter" key press in the tag input.
   * Adds the current tag to the list if it is not empty and not already selected,
   * then clears the input value.
   */
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
      editorRef.current?.getMarkdownContent()?.trim()
  );
  return (
    <>
      <Onboarding screen={OnboardingScreen.WikiCreate} />
      <Box id="wiki-create-form-container">
        <Grid container spacing={1.5} sx={{ marginBottom: 3, marginTop: 0.5 }}>
          <Grid size={6}>
            <BackButton onClick={handleClose} styles={{ padding: "6px" }} />
          </Grid>
          <Grid size={6}>
            {action === "create" ? (
              <ActionButton
                id="wiki-article-action-button"
                onClick={handleCreate}
                disabled={!isFormValid}
              >
                {strings.wikiDocumentation.create}
              </ActionButton>
            ) : (
              <ActionButton id="wiki-article-action-button" onClick={handleEdit}>
                {adminMode && article?.draft
                  ? strings.wikiDocumentation.confirm
                  : strings.wikiDocumentation.save}
              </ActionButton>
            )}
          </Grid>
        </Grid>
        <Card sx={{ padding: 2.5, overflow: "visible", marginBottom: 4 }}>
          <TextField
            id="wiki-article-title-field"
            sx={{ width: "100%" }}
            size="small"
            value={title}
            onChange={handleTitleChange}
            label={strings.wikiDocumentation.labelTitle}
            required
          />
          <Grid container spacing={1.5}>
            <Grid
              size={{
                md: 6,
                xs: 12
              }}
            >
              <TextField
                id="wiki-article-path-field"
                sx={{ width: "100%", marginTop: 3 }}
                size="small"
                value={path}
                onChange={handlePathChange}
                label={strings.wikiDocumentation.labelPath}
                required
              />
            </Grid>
            <Grid
              size={{
                md: 6,
                xs: 12
              }}
            >
              <TagsAutocomplete
                tags={tags}
                tag={tag}
                selectedTags={selectedTags}
                handleTagChange={handleTagChange}
                handleSelectedTagChange={handleSelectedTagChange}
                handleEnter={handleEnter}
                size="small"
                styles={{ marginTop: 3 }}
              />
            </Grid>
          </Grid>
          <Grid container spacing={1.5}>
            <Grid
              size={{
                md: 6,
                xs: 12
              }}
            >
              <TextField
                id="wiki-article-image-field"
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
                    alt={strings.wikiDocumentation.coverImageAlt}
                  />
                  <Grid sx={{ position: "relative" }}>
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
                <>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={
                      isUploadingCover ? (
                        <CircularProgress size={16} thickness={4} />
                      ) : (
                        <FileUploadIcon />
                      )
                    }
                    sx={{
                      marginTop: 1.5,
                      marginBottom: 1,
                      width: "100%",
                      pointerEvents: isUploadingCover ? "none" : "auto"
                    }}
                  >
                    {strings.wikiDocumentation.uploadImage}
                    <input
                      style={{ width: "100%" }}
                      type="file"
                      hidden
                      onChange={handleFileChange}
                    />
                  </Button>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={
                      isUploadingCover ? (
                        <CircularProgress size={16} thickness={4} />
                      ) : (
                        <FileUploadIcon />
                      )
                    }
                    sx={{ marginBottom: 1, width: "100%" }}
                  >
                    {strings.wikiDocumentation.uploadPlayBook}
                    <input style={{ width: "100%" }} type="file" hidden onChange={handleImport} />
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ImageIcon />}
                    sx={{ marginTop: 0.5, marginBottom: 1, width: "100%" }}
                    onClick={handleOpenMediaSelector}
                  >
                    {strings.wikiDocumentation.selectFromExistingFiles}
                  </Button>
                </>
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
            <Grid
              size={{
                md: 6,
                xs: 12
              }}
            >
              <TextField
                id="wiki-article-description-field"
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

          <Box id="wiki-article-content-editor">
            <RichTextEditorLexical
              ref={editorRef}
              markdownContent={article?.content || strings.wikiDocumentation.articleContentRequired}
            />
          </Box>
        </Card>
      </Box>

      {/* Media File Selector Dialog */}
      <Dialog
        open={showMediaSelector}
        onClose={() => setShowMediaSelector(false)}
        maxWidth="sm"
        fullWidth
        disableRestoreFocus
      >
        <DialogTitle>{strings.wikiDocumentation.selectImageFromS3}</DialogTitle>
        <DialogContent>{renderMediaFiles()}</DialogContent>
        <DialogActions>
          <Button onClick={() => setShowMediaSelector(false)}>
            {strings.wikiDocumentation.cancel}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CreateOrEditArticleForm;
