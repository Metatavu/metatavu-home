import { $createCodeNode } from "@lexical/code";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  type ListType
} from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createHeadingNode, $createQuoteNode, type HeadingTagType } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import ArticleIcon from "@mui/icons-material/Article";
import CodeIcon from "@mui/icons-material/Code";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import FormatQuoteSharpIcon from "@mui/icons-material/FormatQuoteSharp";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import InsertLinkIcon from "@mui/icons-material/InsertLink";
import InsertPhotoIcon from "@mui/icons-material/InsertPhoto";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import TitleIcon from "@mui/icons-material/Title";
import { Box, Button, Card, FormControl, Grid, IconButton, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import type { ArticleMetadata } from "src/generated/homeLambdasClient";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  type TextFormatType
} from "lexical";
import { useEffect, useMemo, useState } from "react";
import { useLambdasApi } from "src/hooks/use-api";
import strings from "src/localization/strings";
import { wikiScreenColors } from "src/theme";
import { uploadFile } from "src/utils/s3-file-utils";
import type { ImageAlignment, ImageSize } from "src/utils/image-style-utils";
import { $createImageNode } from "../nodes/image-node";
import ArticleLinkDialog from "./article-link-dialog";

const colors = wikiScreenColors;

interface TextCommand {
  key: string;
  icon: React.JSX.Element;
  handler: () => void;
}

const ToolBar = () => {
  const { articleApi } = useLambdasApi();
  const [editor] = useLexicalComposerContext();
  const [link, setLink] = useState("");
  const [imageLink, setImageLink] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileUploadError, setFileUploadError] = useState("");
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [articleLinkDialogOpen, setArticleLinkDialogOpen] = useState(false);
  const [isLinkSelcted, setIsLinkSelected] = useState(false);
  const [imageSize, setImageSize] = useState<ImageSize>("medium");
  const [imageAlignment, setImageAlignment] = useState<ImageAlignment>("center");
  const [selectedText, setSelectedText] = useState("");

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const anchorNode = selection.anchor.getNode();
          const parent = anchorNode.getParent();
          setIsLinkSelected((parent && $isLinkNode(parent)) || false);
        }
      });
    });
  }, [editor]);

  const commands: TextCommand[] = useMemo(
    () => [
      { key: "paragraph", icon: <TitleIcon />, handler: () => formatParagraph() },
      { key: "bold", icon: <FormatBoldIcon />, handler: () => formatText("bold") },
      { key: "italic", icon: <FormatItalicIcon />, handler: () => formatText("italic") },
      { key: "underline", icon: <FormatUnderlinedIcon />, handler: () => formatText("underline") },
      { key: "h1", icon: <>H1</>, handler: () => formatHeading("h1") },
      { key: "h2", icon: <>H2</>, handler: () => formatHeading("h2") },
      { key: "h3", icon: <>H3</>, handler: () => formatHeading("h3") },
      { key: "Quote", icon: <FormatQuoteSharpIcon />, handler: () => formatQuote() },
      { key: "UL", icon: <FormatListBulletedIcon />, handler: () => formatList("bullet") },
      { key: "OL", icon: <FormatListNumberedIcon />, handler: () => formatList("number") },
      { key: "Code Block", style: "code-block", icon: <CodeIcon />, handler: () => formatCode() },
      {
        key: "add-link",
        icon: isLinkSelcted ? <LinkOffIcon /> : <InsertLinkIcon />,
        handler: isLinkSelcted
          ? () => editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
          : () => {
              setLinkDialogOpen(!linkDialogOpen);
              setImageDialogOpen(false);
              setArticleLinkDialogOpen(false);
            }
      },
      {
        key: "link-article",
        icon: <ArticleIcon />,
        handler: () => {
          editor.getEditorState().read(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              setSelectedText(selection.getTextContent());
            }
          });
          setArticleLinkDialogOpen(!articleLinkDialogOpen);
          setLinkDialogOpen(false);
          setImageDialogOpen(false);
        }
      },
      {
        key: "add-image",
        icon: <InsertPhotoIcon />,
        handler: () => {
          setImageDialogOpen(!imageDialogOpen);
          setLinkDialogOpen(false);
          setArticleLinkDialogOpen(false);
          setFileUploadError("");
        }
      }
    ],
    [isLinkSelcted, linkDialogOpen, imageDialogOpen, articleLinkDialogOpen]
  );

  const formatText = (command: TextFormatType) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, command);
  };

  const formatParagraph = () => {
    editor.update(() => {
      const selection = $getSelection();
      if (isLinkSelcted) editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
      $setBlocksType(selection, () => $createParagraphNode());
    });
  };

  const formatHeading = (tag: HeadingTagType) => [
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(tag));
      }
    })
  ];

  const formatList = (type: ListType) => {
    if (!type) return;
    const command = type === "bullet" ? INSERT_UNORDERED_LIST_COMMAND : INSERT_ORDERED_LIST_COMMAND;
    editor.dispatchCommand(command, undefined);
  };

  const formatQuote = () => {
    editor.update(() => {
      let selection = $getSelection();
      if (!selection) return;
      if (!$isRangeSelection(selection) || selection.isCollapsed()) {
        $setBlocksType(selection, () => $createQuoteNode());
      } else {
        const textContent = selection.getTextContent();
        const codeNode = $createQuoteNode();
        selection.insertNodes([codeNode]);
        selection = $getSelection();
        if ($isRangeSelection(selection)) {
          selection.insertRawText(textContent);
        }
      }
    });
  };

  const formatCode = () => {
    editor.update(() => {
      let selection = $getSelection();
      if (!selection) return;
      if (!$isRangeSelection(selection) || selection.isCollapsed()) {
        $setBlocksType(selection, () => $createCodeNode());
      } else {
        const textContent = selection.getTextContent();
        const codeNode = $createCodeNode();
        selection.insertNodes([codeNode]);
        selection = $getSelection();
        if ($isRangeSelection(selection)) {
          selection.insertRawText(textContent);
        }
      }
    });
  };

  const addLink = () => {
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, link);
    setLinkDialogOpen(false);
    setLink("");
  };

  const handleArticleLinkSelect = (article: ArticleMetadata, linkText: string) => {
    const url = `/wiki-documentation/${article.path}`;
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.insertText(`[${linkText}](${url})`);
      }
    });
    setArticleLinkDialogOpen(false);
    setSelectedText("");
  };

  const addImage = (uploadedImageUrl?: string) => {
    const src = uploadedImageUrl ?? imageLink;
    if (!src) return;

    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const imageNode = $createImageNode(src, src, imageSize, imageAlignment);
        selection.insertNodes([imageNode]);
      }
    });

    setImageLink("");
    setImageDialogOpen(false);
    setImageSize("medium");
    setImageAlignment("center");
  };

  const handleInputChange = (type: "imageLink" | "link") => (event: any) => {
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (file.type?.includes("image/")) {
      setFile(file);
      setFileUploadError("");
    } else {
      setFileUploadError(strings.wikiDocumentation.pleaseUploadImageFile);
      setFile(null);
    }
  };

  const uploadImage = async () => {
    if (!file) return;
    const imageUrl = await uploadFile(file, articleApi);

    if (imageUrl) {
      addImage(imageUrl);
      setFile(null);
      setImageDialogOpen(false);
    }
  };

  const renderLinkInput = () => (
    <Card
      sx={{
        position: "absolute",
        top: { md: "80px", xs: "100px" },
        right: 2,
        padding: 1,
        zIndex: 20
      }}
    >
      <TextField
        sx={{ width: "100%" }}
        value={link}
        onInput={handleInputChange("link")}
        size="small"
        label={strings.wikiDocumentation.labelLink}
        placeholder={strings.wikiDocumentation.labelLinkPlaceholder}
      />
      <Button onClick={() => addLink()}>{strings.wikiDocumentation.add}</Button>
      <Button onClick={() => setLinkDialogOpen(false)}>{strings.wikiDocumentation.close}</Button>
    </Card>
  );

  const renderImageInput = () => (
    <Card
      sx={{
        position: "absolute",
        top: { md: "80px", xs: "100px" },
        right: 3,
        padding: 2,
        zIndex: 20,
        width: { xs: "90%", md: "450px" },
        maxHeight: "80vh",
        overflow: "auto"
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>{strings.wikiDocumentation.insertImage}</Typography>
      
      <TextField
        sx={{ width: "100%", mb: 2 }}
        value={imageLink}
        onInput={handleInputChange("imageLink")}
        size="small"
        label={strings.wikiDocumentation.labelImage}
        placeholder={strings.wikiDocumentation.imageLinkPlaceholder}
      />
      
      <Button
        variant="outlined"
        component="label"
        fullWidth
        sx={{
          mb: 2,
          borderColor: colors.button.main,
          color: colors.button.main,
          "&:hover": {
            borderColor: colors.button.hover,
            backgroundColor: "rgba(0, 0, 0, 0.04)"
          }
        }}
      >
        {strings.wikiDocumentation.uploadImage}
        <input style={{ width: "100%" }} type="file" hidden onChange={handleFileChange} />
      </Button>
      
      {file && !fileUploadError && (
        <Typography sx={{ mb: 2, fontSize: "0.875rem", color: "text.secondary" }}>
          📎 {file?.name}
        </Typography>
      )}
      {fileUploadError && (
        <Typography sx={{ mb: 2, color: "error.main" }}>{fileUploadError}</Typography>
      )}

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6}>
          <FormControl fullWidth size="small">
            <InputLabel>{strings.wikiDocumentation.size}</InputLabel>
            <Select
              value={imageSize}
              label={strings.wikiDocumentation.size}
              onChange={(e) => setImageSize(e.target.value as ImageSize)}
            >
              <MenuItem value="small">{strings.wikiDocumentation.sizeSmall}</MenuItem>
              <MenuItem value="medium">{strings.wikiDocumentation.sizeMedium}</MenuItem>
              <MenuItem value="large">{strings.wikiDocumentation.sizeLarge}</MenuItem>
              <MenuItem value="full">{strings.wikiDocumentation.sizeFull}</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth size="small">
            <InputLabel>{strings.wikiDocumentation.alignment}</InputLabel>
            <Select
              value={imageAlignment}
              label={strings.wikiDocumentation.alignment}
              onChange={(e) => setImageAlignment(e.target.value as ImageAlignment)}
            >
              <MenuItem value="left">{strings.wikiDocumentation.alignLeft}</MenuItem>
              <MenuItem value="center">{strings.wikiDocumentation.alignCenter}</MenuItem>
              <MenuItem value="right">{strings.wikiDocumentation.alignRight}</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", gap: 1 }}>
        {file && !fileUploadError ? (
          <>
            <Button 
              variant="contained" 
              onClick={() => uploadImage()}
              sx={{
                flex: 1,
                backgroundColor: colors.button.main,
                "&:hover": { backgroundColor: colors.button.hover }
              }}
            >
              {strings.wikiDocumentation.upload}
            </Button>
            <Button variant="outlined" onClick={() => setFile(null)}>{strings.label.cancel}</Button>
          </>
        ) : (
          <>
            <Button 
              variant="contained" 
              onClick={() => addImage()}
              disabled={!imageLink}
              sx={{
                flex: 1,
                backgroundColor: colors.button.main,
                "&:hover": { backgroundColor: colors.button.hover }
              }}
            >
              {strings.wikiDocumentation.add}
            </Button>
            <Button variant="outlined" onClick={() => {
              setImageDialogOpen(false);
              setFile(null);
              setFileUploadError("");
            }}>{strings.wikiDocumentation.close}</Button>
          </>
        )}
      </Box>
    </Card>
  );

  return (
    <Box
      sx={{
        position: "sticky",
        top: "20px",
        zIndex: 10,
        backgroundColor: "inherit",
        paddingTop: 1
      }}
    >
      {linkDialogOpen && !imageDialogOpen && renderLinkInput()}
      {!linkDialogOpen && imageDialogOpen && renderImageInput()}
      <ArticleLinkDialog
        open={articleLinkDialogOpen}
        onClose={() => setArticleLinkDialogOpen(false)}
        onSelectArticle={handleArticleLinkSelect}
        selectedText={selectedText}
      />
      <Grid container justifyContent={"space-between"} sx={{ marginBottom: 1 }}>
        {commands.map((command) => (
          <IconButton
            key={`inline-command-${command.key}`}
            onClick={() => command.handler()}
            sx={{ fontSize: "21px", fontWeight: "bold" }}
          >
            {command.icon}
          </IconButton>
        ))}
      </Grid>
    </Box>
  );
};

export default ToolBar;
