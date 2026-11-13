import { CodeNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  TRANSFORMERS
} from "@lexical/markdown";
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
import strings from "src/localization/strings";

const TRANSFORMERS_WITH_IMAGE = [IMAGE_TRANSFORMER, ...TRANSFORMERS];

interface Props {
  markdownContent: string;
  onContentChange: (hasContent: boolean) => void;
}

interface EditorRef {
  getMarkdownContent: () => string | undefined;
}

const RichTextEditorLexical = forwardRef<EditorRef, Props>(
  ({ markdownContent = "", onContentChange }, ref) => {
    const theme = useTheme();
    const [editorState, setEditorState] = useState<EditorState>();
    const setError = useSetAtom(errorAtom);

    const onError = (error: Error) => {
      setError(error.message);
    };

    useImperativeHandle(ref, () => ({
      getMarkdownContent: () => {
        if (!editorState) return markdownContent;
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
            borderColor: theme.palette.border.primary,
            borderRadius: theme.radius.s,
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
              minHeight: { xs: 300, md: 445 },
              boxSizing: "border-box",
              padding: theme.spaces.m
            },
            "& .editor:focus": {
              outline: "none"
            }
          }}
        >
          <ToolBar />
          <Box
            sx={{
              position: "relative",
              borderTop: `1px solid ${theme.palette.border.primary}`
            }}
          >
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  className="editor"
                  aria-labelledby="wiki-article-content-label"
                  aria-placeholder={strings.wikiDocumentation.contentPlaceholder}
                  placeholder={
                    <Box
                      sx={{
                        position: "absolute",
                        insetBlockStart: theme.spaces.l,
                        insetInlineStart: theme.spaces.m,
                        pointerEvents: "none",
                        color: "text.secondary",
                        fontSize: 14
                      }}
                    >
                      {strings.wikiDocumentation.contentPlaceholder}
                    </Box>
                  }
                />
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
            <OnChangePlugin
              setEditorState={(state) => {
                setEditorState(state);
                state.read(() =>
                  onContentChange(Boolean($convertToMarkdownString(TRANSFORMERS_WITH_IMAGE).trim()))
                );
              }}
            />
            <LinkPlugin />
            <ListPlugin />
            <TabIndentationPlugin />
            <MarkdownShortcutPlugin transformers={TRANSFORMERS_WITH_IMAGE} />
          </Box>
        </Card>
      </LexicalComposer>
    );
  }
);

export default RichTextEditorLexical;
