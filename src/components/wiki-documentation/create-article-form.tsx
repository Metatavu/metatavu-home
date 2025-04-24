import { Autocomplete, Box, Button, Card, Checkbox, Chip, Grid, Popper, type PopperProps, styled, TextField } from "@mui/material"
import strings from "src/localization/strings";
import { type ChangeEvent, type KeyboardEvent, type SyntheticEvent, useRef, useState } from "react";
import RichTextEditorLexical from "./rich-text-editor/rich-text-editor";
import { uploadFile } from "src/utils/s3-file-utils";
import { useLambdasApi } from "src/hooks/use-api";
import ActionButton from "./action-button";
import { useSetAtom } from "jotai";
import { articleAtom } from "src/atoms/article";
import { errorAtom } from "src/atoms/error";

const tags = [
  "security",
  "tutorial",
  "trainee"
]

interface Props {
  setFormOpen: (value: boolean) => void;
}

const CreateArticleForm = ({setFormOpen}: Props) => {
  const {articleApi} = useLambdasApi();
  const setError = useSetAtom(errorAtom);
  const setArticlesAtom = useSetAtom(articleAtom);
  const editorRef = useRef(null);
  const [title, setTitle] = useState("");
  const [path, setPath] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [imagePreview, setImagPreview] = useState(false);
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
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
      description: description
    }
    try {
      const response = await articleApi.createArticle({article: newArticle});
      setArticlesAtom((articles) => [response, ...articles])
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
    setPath(`${encodeURIComponent(newInput.replaceAll(" ", "_"))}`)
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
      setImagPreview(true)
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
  }

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
          {strings.wikiDocumentation.back}
        </ActionButton>
        </Grid>
        <Grid item xs={6}>
        <ActionButton onClick={handleCreate}>
          {strings.wikiDocumentation.create}
        </ActionButton>
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
              sx={{width: "100%", marginTop: 3 }}
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
              onInput={handleDescriptionChange}
              label={strings.wikiDocumentation.labelDescription}
            />
          </Grid>
        </Grid>
        <RichTextEditorLexical ref={editorRef}/>
      </Card>
    </>
  )
}

export default CreateArticleForm;