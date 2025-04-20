import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import type { EditorState } from "lexical";
import { useEffect } from "react";

export const  OnChangePlugin = (
  { setEditorState }: 
  { setEditorState: (editorState: EditorState) => void}
) => {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    return editor.registerUpdateListener((listener) => {
      console.log(editor.getEditorState().toJSON())
      setEditorState(listener.editorState)
    });
  }, [editor]);
  return null;
}