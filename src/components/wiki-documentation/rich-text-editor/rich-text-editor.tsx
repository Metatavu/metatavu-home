import { 
  forwardRef, 
  useImperativeHandle, 
  useState 
} from 'react';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import {LexicalErrorBoundary} from '@lexical/react/LexicalErrorBoundary';
import { Box, Card } from '@mui/material';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from "@lexical/list";
import { LinkNode } from "@lexical/link";
import { CodeNode } from "@lexical/code";
import { ImageNode } from './nodes/image-node';
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  TRANSFORMERS
} from '@lexical/markdown';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { OnChangePlugin } from "./plugins"
import ToolBar from './plugins/toolbar-plugin';
import type { EditorState } from 'lexical';
import { IMAGE_TRANSFORMER } from './md-transformers';
import lexicalTheme from './config';
import "./editor.css";

const TRANSFORMERS_WITH_IMAGE = [
  IMAGE_TRANSFORMER,
  ...TRANSFORMERS
];

const onError = (error: Error) => {
  console.error(error.message);
}

const RichTextEditorLexical = forwardRef((props, ref) => {
  const [editorState, setEditorState] = useState<EditorState>();

  // const markdown = `[Example](https://example.com) asdf dad 

  // \`\`\`code block 
  // asdfasdf
  // asdfas
  // dfasdfasdf
  // \`\`\`

  // <script>console.log("I am called")</script>

  // **bold text**   ![Image](https://images.unsplash.com/photo-1478098711619-5ab0b478d6e6?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8Y2F0fGVufDB8fDB8fHww) `;


  const markdown = ""


  useImperativeHandle(ref, () => ({
    getMarkdownContent: () => {
      if (!editorState) return;
      let markdown = ""
      editorState.read(() => {
        markdown = $convertToMarkdownString(TRANSFORMERS_WITH_IMAGE);
      });
      return markdown;
    }
  }));

  const initialConfig = {
    namespace: 'MyEditor',
    theme: lexicalTheme,
    onError,
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      CodeNode,
      QuoteNode,
      LinkNode,
      ImageNode
    ],
    editorState: () => $convertFromMarkdownString(markdown, TRANSFORMERS_WITH_IMAGE)
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <Card
        variant='outlined'
        sx={{ 
          marginTop: 4, 
          padding: 2, 
          paddingTop: 1,
          height: "auto",
          overflow: "visible",
          position: "relative"
        }}
      >  
        <ToolBar/>
        <Box sx={{ 
          minHeight: "200px",
          padding: 1,
          paddingTop: 1, 
          borderTop: '1px solid #eee'
        }}>
          <RichTextPlugin
            contentEditable={
              <ContentEditable className='editor'/>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin/>
          <AutoFocusPlugin/>
          <OnChangePlugin setEditorState={setEditorState}/>
          <LinkPlugin/> 
          <ListPlugin/>
          <TabIndentationPlugin/>
        </Box>
      </Card>
    </LexicalComposer>
  );
})

export default RichTextEditorLexical;