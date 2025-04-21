import { Autocomplete, Box, Button, Card, Checkbox, Chip, Grid, Popper, type PopperProps, styled, TextField } from "@mui/material"
import strings from "src/localization/strings";
import { type ChangeEvent, type KeyboardEvent, type SyntheticEvent, useRef, useState } from "react";
import RichTextEditorLexical from "./rich-text-editor/rich-text-editor";
import { uploadFile } from "src/utils/s3-file-utils";
import { useLambdasApi } from "src/hooks/use-api";
import { wikiScreenColors } from "src/theme";

const colors = wikiScreenColors;

const tags = [
  "security",
  "tutorial",
  "trainee"
]

const CreateArticleForm = () => {
  const {articleApi} = useLambdasApi();
  const editorRef = useRef(null);
  const [title, setTitle] = useState("");
  const [path, setPath] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [imagePreview, setImagPreview] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tag, setTag] = useState("");

  const handleCreate = () => {
    if (!editorRef.current) return;
    const content = editorRef.current?.getMarkdownContent();
    console.log("content: \n", content)
  }

  const handleTitleChange = (event: any) => {
    const newInput = event.target.value;
    setTitle(newInput);
    setPath(`/${encodeURIComponent(newInput.replaceAll(" ", "_"))}`)
  }

  const handlePathChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newInput = event.target.value;
    setPath(newInput);
  }

  const handleFileChange = async (event: any) => {
    const file = event.target.files[0];
    console.log(file.type)
    if (file.type?.includes("image/")) {
      const imageUrl = await uploadFile(file, articleApi);
      setCoverImage(imageUrl || "");
      setImagPreview(true)
    }
  };

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

  const CustomPopper = styled((props: PopperProps) => <Popper {...props} placement="bottom" />)({
    "& .MuiAutocomplete-paper": {
      marginTop: "10px",
      backgroundColor: colors.toolbar.main,
      color: colors.toolbar.text
    }
  });

  return (
    <Card sx={{ padding: 4, overflow: "visible" }}>
      <Button variant="contained" sx={{marginBottom: 3}} onClick={handleCreate}>
        {strings.wikiDocumentation.createArticle}
      </Button>
      <TextField 
        sx={{ width: "100%" }} 
        size="small" 
        label={strings.wikiDocumentation.labelTitle}
        value={title}
        onChange={handleTitleChange}
      />
      <Grid container spacing={1.5}>
        <Grid item md={6}>
          <TextField 
            sx={{ width: "100%", marginTop: 3 }} 
            size="small" 
            label={strings.wikiDocumentation.labelPath}
            value={path}
            onChange={handlePathChange}
          />
        </Grid>
        <Grid item md={6}>
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
                  placeholder='Enter image link'
                  onKeyDown={handleEnter}
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
                    color: colors.toolbar.text, 
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
      <TextField 
        sx={{width: "100%", marginTop: 3 }}
        size="small"
        value={coverImage}
        onInput={handleImageLinkChange}
        label="Image"
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
      {!coverImage  ?
        <Button
          variant="outlined"
          component="label"
          sx={{ marginTop: 1, marginBottom: 1, width: "100%" }}
        >
          Upload File
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
              variant="contained"
              sx={{ marginTop: 1, marginBottom: 1, width: "100%" }}
              onClick={() => setImagPreview(true)}
            >
              Preview
            </Button> : <></>
          }
        </>
      }
      <TextField 
        sx={{width: "100%", marginTop: 3 }} 
        size="small" 
        multiline
        rows={5}
      />
      <RichTextEditorLexical ref={editorRef}/>
    </Card>
  )
}

export default CreateArticleForm;