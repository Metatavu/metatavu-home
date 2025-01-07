import { Button, Typography } from "@mui/material";
import { useState } from "react";
import strings from "src/localization/strings";

/**
 * Displays the PDF in an object element for viewing within the browser
 */
export const PdfObject = ({pdfBlobUrl}: {pdfBlobUrl: string}) => {
  const [bdfBlodUrl] = useState(pdfBlobUrl);
  return (
    <object
      data={bdfBlodUrl + "#toolbar=0&zoom=90"}
      type="application/pdf"
      width="100%"
      height="100%"
      style = {{paddingBottom:"50px", backgroundColor:"white"}}
    >
      <Typography variant="body2" color="textSecondary">
        {strings.memoScreen.unsupportedBrowser}{" "}
        <Button 
          variant="text" 
          href={pdfBlobUrl} 
          download
        >
          {strings.memoScreen.downloadPdf}
        </Button>
      </Typography>
    </object>
  )
}