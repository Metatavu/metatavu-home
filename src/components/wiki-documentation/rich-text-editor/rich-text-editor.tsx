import { CodeNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  TRANSFORMERS
} from "@lexical/markdown";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { Box, Card, useTheme } from "@mui/material";
import type { EditorState } from "lexical";
import { forwardRef, useImperativeHandle, useState } from "react";
import lexicalTheme from "./config";
import { IMAGE_TRANSFORMER } from "./md-transformers";
import { ImageNode } from "./nodes/image-node";
import { OnChangePlugin } from "./plugins";
import ToolBar from "./plugins/toolbar-plugin";
import "./editor.css";
import { useSetAtom } from "jotai";
import { errorAtom } from "src/atoms/error";

const TRANSFORMERS_WITH_IMAGE = [IMAGE_TRANSFORMER, ...TRANSFORMERS];

interface Props {
  markdownContent: string;
}

interface EditorRef {
  getMarkdownContent: () => string | undefined;
}

const RichTextEditorLexical = forwardRef<EditorRef, Props>(({ markdownContent = "" }, ref) => {
  const theme = useTheme();
  const [editorState, setEditorState] = useState<EditorState>();
  const setError = useSetAtom(errorAtom);

  const onError = (error: Error) => {
    setError(error.message);
  };

  useImperativeHandle(ref, () => ({
    getMarkdownContent: () => {
      if (!editorState) return;
      let markdown = "";
      editorState.read(() => {
        markdown = $convertToMarkdownString(TRANSFORMERS_WITH_IMAGE);
      });
      return markdown;
    }
  }));

  const initialConfig = {
    namespace: "MyEditor",
    theme: lexicalTheme,
    onError,
    nodes: [HeadingNode, ListNode, ListItemNode, CodeNode, QuoteNode, LinkNode, ImageNode],
    editorState: () => $convertFromMarkdownString(markdownContent, TRANSFORMERS_WITH_IMAGE)
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <Card
        variant="outlined"
        elevation={0}
        sx={{
          marginTop: 4,
          padding: 2,
          paddingTop: 1,
          height: "auto",
          overflow: "visible",
          position: "relative",
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          "& .editor-quote": {
            color: theme.palette.text.secondary,
            borderLeft: `4px solid ${theme.palette.divider}`,
            paddingLeft: 2
          },
          "& .editor-code": {
            backgroundColor:
              theme.palette.mode === "dark" ? theme.palette.background.default : "#e9e8e8",
            color: theme.palette.mode === "dark" ? theme.palette.text.primary : "#727272"
          },
          "& a": {
            color: theme.palette.primary.main,
            textDecoration: "underline",
            textUnderlineOffset: 2,
            transition: "color 0.2s ease"
          },
          "& a:hover": {
            opacity: 0.8
          },
          "& .editor": {
            minHeight: "400px"
          },
          "& .editor:focus": {
            outline: "none"
          }
        }}
      >
        <ToolBar />
        <Box
          sx={{
            minHeight: "200px",
            padding: 1,
            paddingTop: 1,
            borderTop: `1px solid ${theme.palette.divider}`
          }}
        >
          <RichTextPlugin
            contentEditable={<ContentEditable className="editor" />}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <AutoFocusPlugin />
          <OnChangePlugin setEditorState={setEditorState} />
          <LinkPlugin />
          <ListPlugin />
          <TabIndentationPlugin />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS_WITH_IMAGE} />
        </Box>
      </Card>
    </LexicalComposer>
  );
});

export default RichTextEditorLexical;
