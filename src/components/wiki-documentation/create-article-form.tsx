import { Autocomplete, Box, Button, Card, Checkbox, Chip, Grid, Popper, type PopperProps, styled, TextField } from "@mui/material"
import strings from "src/localization/strings";
import { type ChangeEvent, type KeyboardEvent, type SyntheticEvent, useRef, useState } from "react";
import RichTextEditorLexical from "./rich-text-editor/rich-text-editor";
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import { uploadFile } from "src/utils/s3-file-utils";
import { useLambdasApi } from "src/hooks/use-api";
import ActionButton from "./action-button";
import { useSetAtom } from "jotai";
import { articleAtom, draftArticleAtom } from "src/atoms/article";
import { errorAtom } from "src/atoms/error";
import type { Article } from "src/generated/homeLambdasClient";

const tags = [
  "security",
  "tutorial",
  "trainee"
]

interface Props {
  setFormOpen: (value: boolean) => void;
  adminMode: boolean;
  action: "edit"|"create";
  article?: Article;
}

const CreateOrEditArticleForm = ({
  setFormOpen, 
  action="create", 
  article, 
  adminMode
} : Props) => {
  const {articleApi} = useLambdasApi();
  const setError = useSetAtom(errorAtom);
  const setArticlesAtom = useSetAtom(articleAtom);
  const setDraftArticlesAtom = useSetAtom(draftArticleAtom);
  const editorRef = useRef(null);
  const [title, setTitle] = useState(article ? article.title : "");
  const [path, setPath] = useState(article ? article.path : "");
  const [coverImage, setCoverImage] = useState(article ? article.coverImage : "");
  const [description, setDescription] = useState(article ? article.description : "");
  const [imagePreview, setImagPreview] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(article ? article.tags||[] : []);
  const [tag, setTag] = useState("");

  const handleCreate = async () => {
    if (!editorRef.current) return;
    const content = editorRef.current?.getMarkdownContent();
    const newArticle = {
      path: path,
      title: title,
      createdBy: "Kseniia",
      content: content,
      tags: selectedTags,
      coverImage: coverImage,
      description: description,
      draft: !adminMode
    }
    try {
      const response = await articleApi.createArticle({article: newArticle});
      if (!adminMode) setDraftArticlesAtom((articles) => [response, ...articles]);
      else setArticlesAtom((articles) => [response, ...articles]);
      setFormOpen(false);
    }
    catch (error: any) {
      const message = (await error.response.json()).message;
      setError(message);
    }
  }

  const handleEdit = async () => {
    if (!editorRef.current || !article?.id) return;
    const content = editorRef.current?.getMarkdownContent();
    const updatedArticle = {
      path: path,
      title: title,
      createdBy: "Kseniia",
      content: content,
      tags: selectedTags,
      coverImage: coverImage,
      description: description,
      draft: !adminMode
    }
    try {
      const response = await articleApi.updateArticle({article: updatedArticle, id: article.id});
      if (!adminMode) {
        setDraftArticlesAtom((articles) => [response, ...articles]);
        setArticlesAtom((articles) => articles.filter(article => article.id!==response.id));
      }
      else {
        if (article.draft) setDraftArticlesAtom((articles) => articles.filter(article => article.id!==response.id));
        else setArticlesAtom((articles) => articles.filter(article => article.id!==response.id))
        setArticlesAtom((articles) => [response, ...articles]);
      }
      setFormOpen(false);
    }
    catch (error: any) {
      const message = (await error.response.json()).message;
      setError(message);
    }
  }

  const closeForm = () => setFormOpen(false);

  const handleTitleChange = (event: any) => {
    const newInput = event.target.value;
    setTitle(newInput);
    setPath(`${encodeURIComponent(newInput.replaceAll(" ", "_"))}`);
  }

  const handlePathChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newInput = event.target.value;
    setPath(newInput);
  }

  const handleFileChange = async (event: any) => {
    const file = event.target.files[0];
    if (file.type?.includes("image/")) {
      const imageUrl = await uploadFile(file, articleApi);
      setCoverImage(imageUrl || "");
      setImagPreview(true);
    }
  };

  const handleDescriptionChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newInput = event.target.value;
    setDescription(newInput);
  }

  const handleTagChange = (_event: SyntheticEvent<Element, Event>, value: string) => 
    setTag(value);

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

  const CustomPopper = styled((props: PopperProps) => 
    <Popper {...props} placement="bottom" />) ({
    "& .MuiAutocomplete-paper": {
      marginTop: "10px"
    }
  });

  return (
    <>
      <Grid container spacing={1.5} sx={{ marginBottom: 3, marginTop: 0.5 }}>
        <Grid item xs={6}>
        <ActionButton onClick={closeForm}>
          <>
            <KeyboardReturnIcon sx={{marginRight: 1}}/>
            {strings.wikiDocumentation.back}
          </>
        </ActionButton>
        </Grid>
        <Grid item xs={6}>
        {action === "create" ?
          <ActionButton onClick={handleCreate}>
            {strings.wikiDocumentation.create}
          </ActionButton>
          : 
          <ActionButton onClick={handleEdit}>
            {strings.wikiDocumentation.save}
          </ActionButton>
        }
        </Grid>
      </Grid>
      <Card sx={{ padding: 2.5, overflow: "visible", marginBottom: 4 }}>
        <TextField 
          sx={{ width: "100%" }} 
          size="small"
          value={title}
          onChange={handleTitleChange}
          label={strings.wikiDocumentation.labelTitle}
        />
        <Grid container spacing={1.5}>
          <Grid item md={6} xs={12}>
            <TextField 
              sx={{ width: "100%", marginTop: 3 }} 
              size="small" 
              value={path}
              onChange={handlePathChange}
              label={strings.wikiDocumentation.labelPath}
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
                )
              }}
              renderOption={(props, option, {selected}) => (
                <li
                  {...props}
                  style={{ display: "flex", alignItems: "center" }}
                  key={`tags-option-${option}`}
                >
                  <Checkbox 
                    sx={{
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
            />
            {imagePreview
              ? <img 
                style={{ 
                  height: "150px", 
                  borderRadius: "15px", 
                  marginTop: "16px"
                }} 
                src={coverImage} 
                alt="cover-image"
              /> : <></>
            }
            {!coverImage ?
              <Button
                variant="outlined"
                component="label"
                sx={{ marginTop: 1.5, marginBottom: 1, width: "100%" }}
              >
                {strings.wikiDocumentation.uploadImage}
                <input
                  style={{width: "100%"}}
                  type="file"
                  hidden
                  onChange={handleFileChange}
                />
              </Button> : 
              <>
                {!imagePreview ?
                  <Button 
                    variant="outlined"
                    sx={{ marginTop: 1, marginBottom: 1, width: "100%" }}
                    onClick={() => setImagPreview(true)}
                  >
                    {strings.wikiDocumentation.imagePreview}
                  </Button> : <></>
                }
              </>
            }
          </Grid>
          <Grid item md={6} xs={12}>
            <TextField 
              sx={{width: "100%", marginTop: 3 }} 
              size="small"
              multiline
              rows={3}
              value={description}
              onInput={handleDescriptionChange}
              label={strings.wikiDocumentation.labelDescription}
            />
          </Grid>
        </Grid>
        <RichTextEditorLexical ref={editorRef} markdownContent={article?.content || ""}/>
      </Card>
    </>
  )
}

export default CreateOrEditArticleForm;