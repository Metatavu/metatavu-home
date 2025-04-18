import { forwardRef, useImperativeHandle, useState } from 'react';
import { 
  Editor, 
  CompositeDecorator, 
  type ContentState, 
  EditorState, 
  RichUtils, 
  convertFromRaw, 
  type ContentBlock, 
  type SelectionState, 
  Modifier,
  convertToRaw
} from 'draft-js';
import { 
  Box,
  Button, 
  Card, 
  Grid, 
  IconButton,
  TextField, 
  Typography
} from '@mui/material';
import { draftToMarkdown, markdownToDraft } from 'markdown-draft-js';
import 'draft-js/dist/Draft.css';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import CodeIcon from '@mui/icons-material/Code';
import FormatQuoteSharpIcon from '@mui/icons-material/FormatQuoteSharp';
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import { useLambdasApi } from 'src/hooks/use-api';
import config from 'src/app/config';

const inlineStyles = [
  { name: "bold", style: "BOLD", icon: <FormatBoldIcon/>},
  { name: "italic", style: "ITALIC", icon: <FormatItalicIcon/>},
  { name: "code", style: "CODE", icon: <CodeIcon/>}
];

const blockTypes = [
  { name: 'H1', style: 'header-one', icon: "H1" },
  { name: 'H2', style: 'header-two', icon: "H2" },
  { name: 'H3', style: 'header-three', icon: "H3" },
  { name: 'H4', style: 'header-four', icon: "H4" },
  { name: 'H5', style: 'header-five', icon: "H5" },
  { name: 'H6', style: 'header-six', icon: "H6" },
  { name: 'Quote', style: 'blockquote', icon: <FormatQuoteSharpIcon /> },
  { name: 'UL', style: 'unordered-list-item', icon: <FormatListBulletedIcon /> },
  { name: 'OL', style: 'ordered-list-item', icon: <FormatListNumberedIcon /> },
  { name: 'Code Block', style: 'code-block', icon: <CodeIcon /> },
];

const parseImages = {
  blockEntities: {
    image: (item: any) => {
      return {
        type: 'IMAGE',
        mutability: 'MUTABLE',
        data: {
          src: item?.src,
          alt: item?.alt
        },
      }
    }
  }
}

const covertToMDImges = {
  entityItems: {
    IMAGE: {
      open: (entity: any) => {
        return '';
      },
      close: (entity: any) => {
        return `![${entity.data.alt}](${entity.data.src})`;
      },
    },
  },
};

const s3ImageFolder = config.s3.articleImagesFolder;
const s3ArticleBucket = config.s3.articleBuket;

const RichTextEditorDraft = forwardRef((props, ref) => {
  //const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const { articleApi } = useLambdasApi();
  const [link, setLink] = useState("");
  const [imageLink, setImageLink] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileUploadError, setFileUploadError] = useState("");
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [savedSelection, setSavedSelection] = useState<SelectionState | null>(null);

  const markDown = `[Example](https://example.com) asdf dad  **bold text** 
  ![Image](https://images.unsplash.com/photo-1478098711619-5ab0b478d6e6?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8Y2F0fGVufDB8fDB8fHww)  
  `; 

  useImperativeHandle(ref, () => ({
    getMarkdownContent: () => {
      const content = convertToRaw(editorState.getCurrentContent());
      return draftToMarkdown(content, covertToMDImges);
    }
  }));

  const rawContent = markdownToDraft(markDown, parseImages);
  rawContent.blocks.forEach(block => {
    block.entityRanges.forEach(entity => {
      if (entity.length === 0 && rawContent.entityMap[entity.key].type === "IMAGE") {
        entity.length +=  1
        block.text = `${block.text?.slice(0, entity.offset)}\u200b${block.text.slice(entity.offset, block.text?.length)} \n`;
      }
    })
  });

  const findEntities = (type: string) =>
    (contentBlock: ContentBlock, callback: (start: number, end: number) => void, contentState: ContentState) => {
      contentBlock.findEntityRanges(
        character => {
          const entityKey = character.getEntity();
          return (
            entityKey !== null &&
            contentState.getEntity(entityKey).getType() === type
          );
        },
        callback
      );
    };

  const Link = (props: any) => {
    if (!props.contentState) return;
    const { url } = props.contentState
      .getEntity(props.entityKey)
      .getData();
    return (
      <a href={url}>
        {props.children}
      </a>
    );
  };

  const Image = (props: {
    contentState: ContentState;
    entityKey: string;
  }) => {
    if (!props.contentState) return;
    const { src, alt } = props.contentState
    .getEntity(props.entityKey)
    .getData();
    return (
      <span 
        contentEditable={false} 
        style={{ 
          display: "inline-block", 
          margin: "0 4px" 
        }}
      >
        <img
          src={src}
          alt={alt}
          style={{
            maxHeight: "200px",
            maxWidth: "100%",
            verticalAlign: "middle",
            borderRadius: "8px"
          }}
        />
      </span>
    );
  }

  const decorator = new CompositeDecorator([{
      strategy: findEntities("LINK"),
      component: Link,
    }, {
      strategy: findEntities("IMAGE"),
      component: Image
    }
  ]);

  const contentState = convertFromRaw(rawContent);
  const [editorState, setEditorState] = useState(EditorState.createWithContent(contentState, decorator));

  const toggleInlineStyle = (style: string) => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, style));
  };

  const toggleBlockType = (style: string) => {
    setEditorState(RichUtils.toggleBlockType(editorState, style));
  };

  const handleInputChange = (type: "imageLink"|"link") => 
    (event: any) => {
    const newInput = event.target.value;
    switch (type) {
      case "imageLink": {
        setImageLink(newInput);
        break;
      }
      case "link": {
        setLink(newInput);
        break;
      }
    }
  };

  const handleFileChange = (event: any) => {
    const file = event.target.files[0];
    if (file || file.type.startsWith("image/")) setFile(file);
    else setFile(null);
  };

  const addLink = () => {
    if (!savedSelection || savedSelection.isCollapsed()) {
      return;
    }
    const url = link;
    if (!url) return;
    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity(
      "LINK",
      "MUTABLE",
      { url }
    );
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const contentStateWithLink = Modifier.applyEntity(
      contentStateWithEntity,
      savedSelection,
      entityKey
    );
    const newEditorState = EditorState.push(
      editorState,
      contentStateWithLink,
      "apply-entity"
    );
    setEditorState(EditorState.forceSelection(newEditorState, savedSelection));
    setLinkDialogOpen(false);
    setLink("")
    setSavedSelection(null);
  };

  const addImage = (uploadedImageUrl?: string) => {
    const src = uploadedImageUrl ?? imageLink;
    if (!savedSelection || !src) return;

    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity(
      "IMAGE",
      "IMMUTABLE",
      { src: src, alt: src }
    );

    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const newContentState = Modifier.insertText(
      contentStateWithEntity,
      savedSelection,
      '\u200b',
      undefined,
      entityKey
    );

    const newEditorState = EditorState.push(
      editorState,
      newContentState,
      'insert-characters'
    );

    setEditorState(EditorState.forceSelection(newEditorState, newContentState.getSelectionAfter()));
    setImageLink("");
    setSavedSelection(null);
    setImageDialogOpen(false);
  };

  const renderLinkInput = () => (
    <Card sx={{ 
      position: "absolute", 
      top: {md: "80px", xs: "100px"}, 
      right: 2, 
      padding: 1,
      zIndex: 20
    }}
    >
      <TextField 
        sx={{width: "100%"}}
        value={link}
        onInput={handleInputChange("link")}
        placeholder='aEnter link'
      />

      <Button onClick={() => addLink()}>Add</Button>
      <Button onClick={() => setLinkDialogOpen(false)}>Close</Button>
    </Card>
  );

  const renderImageInput = () => (
    <Card sx={{ 
      position: "absolute", 
      top: {md: "80px", xs: "100px"}, 
      right: 3, 
      padding: 1, 
      zIndex: 20,
      width: "50%"
    }}>
      <TextField 
        sx={{width: "100%"}}
        value={imageLink}
        onInput={handleInputChange("imageLink")}
        placeholder='Enter image link'
      />
      <Button
        variant="contained"
        component="label"
        sx={{ marginTop: 1, marginBottom: 1 }}
        fullWidth
      >
        Upload File
        <input
          style={{width: "100%"}}
          type="file"
          hidden
          onChange={handleFileChange}
        />
      </Button>
      {file ? <Typography>{file.name}</Typography> : <></>}
      {fileUploadError ?? <Typography>{fileUploadError}</Typography>}
      {file ? 
        <Button onClick={() => uploadFile()}>Upload</Button>
        : <Button onClick={() => addImage()}>Add</Button>
      }
      {file ? 
        <Button onClick={() => setFile(null)}>Cancel</Button>
        : <Button onClick={() => setImageDialogOpen(false)}>Close</Button>
      }
    </Card>
  );

  const uploadFile = async () => {
    if (!file) return;
    const filePath = `${s3ImageFolder}/${file.name}`;

    const presignedUrlResponse = await articleApi.uploadFileForArticle({
      fileMetadata: {
        path: filePath,
        contentType: file.type
      }
    });

    const uploadResponse = await fetch(presignedUrlResponse.data, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file
    });

    if (uploadResponse.status === 200) {
      addImage(`${s3ArticleBucket}/${s3ImageFolder}/${file.name}`)
      setFile(null);
      setImageDialogOpen(false);
    }
  };

  return (
    <Card sx={{ 
      marginTop: 4, 
      padding: 2, 
      height: "auto",
      overflow: "visible",
      position: "relative"
    }}>  
      <Box sx={{
      position: 'sticky',
      top: "20px",
      zIndex: 10,
      backgroundColor: "inherit",
      paddingBottom: 1,
      paddingTop: 2
      }}>
        {linkDialogOpen && !imageDialogOpen && renderLinkInput()}
        {!linkDialogOpen && imageDialogOpen && renderImageInput()}
        <Grid 
          container
          justifyContent={"space-between"} 
          sx={{ marginBottom: 1 }}
        >
          {inlineStyles.map(inlineStyle =>
            <IconButton 
              key={`inline-style-${inlineStyle.name}`}
              onClick={() => toggleInlineStyle(inlineStyle.style)} 
            >
              {inlineStyle.icon}
            </IconButton>
          )}
          {blockTypes.map(blockType => 
            <IconButton
              key={`block-style-${blockType.name}`}
              onClick={() => toggleBlockType(blockType.style)} 
              sx={{ fontWeight: 'bold', fontSize: "19px" }}
            >
              {blockType.icon}
            </IconButton>
          )}
          <IconButton 
            key={"add-link"}
            onClick={() => {
              const selection = editorState.getSelection();
              setSavedSelection(selection);
              setLinkDialogOpen(!linkDialogOpen);
              setImageDialogOpen(false);
            }} 
          >
            <InsertLinkIcon/>
          </IconButton>
          <IconButton 
            key={"add-image"}
            onClick={() => {
              const selection = editorState.getSelection();
              setSavedSelection(selection);
              setImageDialogOpen(!imageDialogOpen);
              setLinkDialogOpen(false);
            }} 
          >
            <InsertPhotoIcon/>
          </IconButton>
        </Grid>
      </Box>
      <Box sx={{ 
        minHeight: "400px",
        padding: 1,
        paddingTop: 2, 
        borderTop: '1px solid #eee'
      }}>
        <Editor
          editorState={editorState}
          onChange={setEditorState}
          placeholder="Start typing..."
        />
      </Box>
    </Card>
  );
});

export default RichTextEditorDraft;