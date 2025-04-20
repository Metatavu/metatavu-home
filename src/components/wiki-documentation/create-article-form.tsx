import { Button, Card, TextField } from "@mui/material"
import strings from "src/localization/strings";
import { useRef, useState } from "react";
import RichTextEditorLexical from "./rich-text-editor/rich-text-editor";

const CreateArticleForm = () => {
  const editorRef = useRef(null);

  const handleCreate = () => {
    if (!editorRef.current) return;
    const content = editorRef.current?.getMarkdownContent();
    console.log("content: \n", content)
  }


  return (
    <Card sx={{ padding: 4, overflow: "visible" }}>
      <Button variant="contained" sx={{marginBottom: 3}} onClick={handleCreate}>
        {strings.wikiDocumentation.createArticle}
      </Button>
      <TextField 
        sx={{ width: "100%" }} 
        size="small" 
        label={strings.wikiDocumentation.labelTitle}
      />
      <TextField 
        sx={{ width: "100%", marginTop: 3 }} 
        size="small" 
        label={strings.wikiDocumentation.labelPath}
      />
      <RichTextEditorLexical ref={editorRef}/>
    </Card>
  )
}

export default CreateArticleForm;