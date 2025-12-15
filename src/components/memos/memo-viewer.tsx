import { 
  AutoAwesomeSharp, 
  GTranslateSharp, 
  PictureAsPdfSharp 
} from "@mui/icons-material";
import { 
  Box, 
  Button, 
  Card, 
  CircularProgress, 
  Typography 
} from "@mui/material";
import { useAtom, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { errorAtom } from "src/atoms/error";
import { languageAtom } from "src/atoms/language";
import { useLambdasApi } from "src/hooks/use-api";
import strings from "src/localization/strings";
import { PdfObject } from "./memo-component";


/**
 * Component to display a selected PDF file with services provided
 */
export const PdfViewer = ({ fileId }: { fileId: string }) => {
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translated, setTranslated] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [summaryText, setSummaryText] = useState<string>();
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [language] = useAtom(languageAtom);
  const { memoApi } = useLambdasApi();
  const setError = useSetAtom(errorAtom);

  useEffect(() => {
    if (fileId) fetchPdf();
  }, [fileId]);

  /**
   * Fetches memo pdf file
   */
  const fetchPdf = async () => {
    setLoading(true);
    try {
      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
      const pdfBlob = await memoApi.getContentMemo({ fileId });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setPdfBlobUrl(pdfUrl);
      setTranslated(false);
    } catch (err) {
      setError(strings.memoRequestError.fetchPdfError);
    }
    setLoading(false);
  };

  /**
   * Switches the original or translated pdf
   */
  const handleTranslatedPdf = async () => {
    if (!translated) 
      await translatePdf();
    else await fetchPdf();
  };

  /**
   * Fetches translated memo pdf file
   */
  const translatePdf = async () => {
    setIsTranslating(true);
    try {
      const translatedPdf = await memoApi.getTranslatedMemoPdf({ fileId });
      const pdfUrl = URL.createObjectURL(translatedPdf);
      setPdfBlobUrl(pdfUrl);
      setTranslated(true);
    } catch (error) {
      setError(strings.memoRequestError.downloadTranslatedError);
    } 
    setIsTranslating(false);
  } 

  /**
   * Fetches summary for a memo
   */
  const handleSummary = async () => {
    setSummaryLoading(true);
    try {
      setIsDialogOpen(true);
      const summary = await memoApi.getSummaryMemo({ fileId });
      const text = language === "fi" ? summary.fi ?? "" : summary.en ?? "";
      setSummaryText(text);
    } catch (error) {
      setError(strings.memoRequestError.fetchSummaryError);
    }
    setSummaryLoading(false);
  };

  let pdfContent = null;
  if (loading || isTranslating) {
    pdfContent = (
      <Box sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255, 255, 255, 0.7)",
      }}>
        <CircularProgress />
      </Box>
    );
  } else if (pdfBlobUrl) {
    pdfContent = <PdfObject pdfBlobUrl={pdfBlobUrl} />;
  } else {
    pdfContent = (
      <Typography variant="body1" color="error">
        {strings.memoScreen.failedToLoadPdf}
      </Typography>
    );
  }

  return (
    <Card sx={{ 
      p: 2, 
      width: "100%", 
      height: "100%",
      position: "relative"
    }}>
      <Box 
        display="flex" 
        alignItems="center" 
        gap={1}
        mb={2}
      >
        <Box 
          display="flex" 
          alignItems="center" 
          gap={0.5}
        >
          <PictureAsPdfSharp />
          <Button 
            variant="text" 
            href={pdfBlobUrl || ""} 
            download 
            disabled={isTranslating || !pdfBlobUrl}
          >
            {strings.memoScreen.download}
          </Button>
        </Box>
        
        <Box 
          display="flex" 
          alignItems="center" 
          gap={0.5}
        >
          <GTranslateSharp />
          <Button onClick={handleTranslatedPdf} disabled={!fileId || isTranslating}>
            {translated ? strings.memoScreen.originalPdf : strings.memoScreen.translatePdf}
          </Button>
        </Box>
        
        <Box display="flex" alignItems="center" gap={0.5}>
          <AutoAwesomeSharp />
          <Button onClick={handleSummary} disabled={isTranslating}>
            {strings.memoScreen.viewSummary}
          </Button>
        </Box>
      </Box>
      {pdfContent}
      {isDialogOpen && (
        <Box sx={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translate(-50%, -20%)",
          bgcolor: "background.paper",
          border: "1px solid #ccc",
          boxShadow: 24,
          p: 3,
          width: "80%",
        }}>
          <Typography variant="h6" gutterBottom>
            {strings.memoScreen.summaryTitle}
          </Typography>
          {summaryLoading ? (
            <Box 
              display="flex" 
              justifyContent="center" 
              alignItems="center" 
              minHeight="100px"
            >
              <CircularProgress />
            </Box>
          ) : (
            <Typography variant="body1">{summaryText}</Typography>
          )}
          <Button onClick={() => setIsDialogOpen(false)} color="primary" fullWidth>
            {strings.memoScreen.close}
          </Button>
        </Box>
      )}
    </Card>
  );
};