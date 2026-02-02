import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  TextField,
  Typography
} from "@mui/material";
import LinkIcon from "@mui/icons-material/Link";
import ArticleIcon from "@mui/icons-material/Article";
import { useAtomValue } from "jotai";
import { useState } from "react";
import { articleAtom } from "src/atoms/article";
import type { ArticleMetadata } from "src/generated/homeLambdasClient";
import strings from "src/localization/strings";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelectArticle: (article: ArticleMetadata, linkText: string) => void;
  selectedText?: string;
}

/**
 * Autocomplete dropdown paper component for article search results
 */
const AutocompleteDropdown = ({ children }: { children?: React.ReactNode }) => (
  <Paper elevation={8} sx={{ mt: 1 }}>
    {children}
  </Paper>
);

/**
 * Dialog for searching and linking to other existing wiki articles
 */
const ArticleLinkDialog = ({ open, onClose, onSelectArticle, selectedText = "" }: Props) => {
  const articles = useAtomValue(articleAtom);
  const [selectedArticle, setSelectedArticle] = useState<ArticleMetadata | null>(null);
  const [linkText, setLinkText] = useState(selectedText);

  const handleConfirm = () => {
    if (selectedArticle) {
      onSelectArticle(selectedArticle, linkText || selectedArticle.title);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedArticle(null);
    setLinkText(selectedText);
    onClose();
  };

  const handleArticleChange = (_: any, newValue: ArticleMetadata | null) => {
    setSelectedArticle(newValue);
    if (!selectedText && newValue) {
      setLinkText(newValue.title);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: "80vh"
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <LinkIcon sx={{ color: "primary.main" }} />
          <Typography variant="h6" fontWeight={600}>
            {strings.wikiDocumentation.linkToArticle}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {strings.wikiDocumentation.searchAndSelectArticle}
        </Typography>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 3 }}>
        <Autocomplete
          options={articles || []}
          getOptionLabel={(option) => option.title}
          value={selectedArticle}
          onChange={handleArticleChange}
          renderInput={(params) => (
            <TextField 
              {...params} 
              label={strings.wikiDocumentation.searchArticle} 
              placeholder={strings.wikiDocumentation.startTypingToSearch} 
              variant="outlined"
              fullWidth
            />
          )}
          renderOption={(props, option) => (
            <li {...props} key={option.id}>
              <Box 
                sx={{ 
                  width: "100%", 
                  py: 1.5,
                  px: 1,
                  borderRadius: 1,
                  "&:hover": {
                    backgroundColor: "action.hover"
                  }
                }}
              >
                <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                  <ArticleIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                  <Typography variant="body1" fontWeight={500}>
                    {option.title}
                  </Typography>
                </Box>
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ pl: 3, display: "block" }}
                >
                  {option.path}
                </Typography>
                {option.tags && option.tags.length > 0 && (
                  <Box display="flex" gap={0.5} mt={1} pl={3} flexWrap="wrap">
                    {option.tags.slice(0, 3).map((tag) => (
                      <Chip 
                        key={tag} 
                        label={tag} 
                        size="small" 
                        sx={{ height: 20, fontSize: "0.7rem" }}
                      />
                    ))}
                  </Box>
                )}
              </Box>
            </li>
          )}
          noOptionsText={strings.wikiDocumentation.noArticlesFound}
          PaperComponent={AutocompleteDropdown}
        />
        
        {selectedArticle && (
          <>
            <TextField
              fullWidth
              label={strings.wikiDocumentation.linkText}
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              placeholder={strings.wikiDocumentation.linkTextPlaceholder}
              variant="outlined"
              sx={{ mt: 3 }}
              helperText={strings.wikiDocumentation.linkTextHelper}
            />
            <Paper 
              elevation={0} 
              sx={{ 
                mt: 2, 
                p: 2, 
                backgroundColor: "primary.50",
                border: "1px solid",
                borderColor: "primary.200",
                borderRadius: 2
              }}
            >
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {strings.wikiDocumentation.selectedArticle}
              </Typography>
              <Typography variant="body1" fontWeight={600} sx={{ mt: 1 }}>
                {selectedArticle.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {selectedArticle.description || strings.wikiDocumentation.noDescriptionAvailable}
              </Typography>
            </Paper>
          </>
        )}
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button 
          onClick={handleClose}
          variant="outlined"
          sx={{ minWidth: 100 }}
        >
          {strings.label.cancel}
        </Button>
        <Button 
          onClick={handleConfirm} 
          disabled={!selectedArticle } 
          variant="contained"
          startIcon={<LinkIcon />}
          sx={{ minWidth: 120 }}
        >
          {strings.wikiDocumentation.insertLink}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ArticleLinkDialog;
