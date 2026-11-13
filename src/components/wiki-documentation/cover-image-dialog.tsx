import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
  useTheme
} from "@mui/material";
import { useEffect, useId, useRef, useState } from "react";
import coverPlaceholder from "../../../resources/img/wiki/cover-placeholder.png";
import closeIcon from "../../../resources/img/wiki/editor/close.svg";
import { useLambdasApi } from "src/hooks/use-api";
import strings from "src/localization/strings";
import { getHttpsUrlFromS3, listMediaFiles, uploadFile } from "src/utils/s3-file-utils";

const acceptedTypes = ["image/jpeg", "image/png", "image/gif", "image/svg+xml"];

const parseImageUrl = (url: string) => {
  try {
    return new URL(url);
  } catch {
    return undefined;
  }
};

interface Props {
  currentImage: string;
  onClose: () => void;
  onSave: (image: string) => void;
}

const CoverImageDialog = ({ currentImage, onClose, onSave }: Props) => {
  const theme = useTheme();
  const labels = strings.wikiDocumentation;
  const { articleApi } = useLambdasApi();
  const titleId = useId();
  const urlId = useId();
  const fileInput = useRef<HTMLInputElement>(null);
  const savingRef = useRef(false);
  const [url, setUrl] = useState(currentImage);
  const [file, setFile] = useState<File>();
  const [mediaFiles, setMediaFiles] = useState<string[]>();
  const [galleryError, setGalleryError] = useState(false);
  const [fileError, setFileError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    listMediaFiles(articleApi)
      .then((files) => {
        if (active) setMediaFiles(files);
      })
      .catch(() => {
        if (active) setGalleryError(true);
      });
    return () => {
      active = false;
    };
  }, [articleApi]);

  const selectFile = (nextFile?: File) => {
    if (!nextFile || savingRef.current) return;
    if (!acceptedTypes.includes(nextFile.type)) {
      setFileError(labels.invalidCoverFile);
      return;
    }
    setFileError("");
    setFile(nextFile);
    setUrl("");
  };

  const selectUrl = (nextUrl: string) => {
    setFile(undefined);
    setFileError("");
    setUrl(nextUrl);
  };

  const trimmedUrl = url.trim();
  const parsedUrl = parseImageUrl(trimmedUrl);
  const canSave = Boolean(
    file ||
      (parsedUrl && ["https:", "http:"].includes(parsedUrl.protocol) && trimmedUrl !== currentImage)
  );

  const handleSave = async () => {
    if (savingRef.current || !canSave) return;
    if (!file) {
      onSave(trimmedUrl);
      return;
    }

    savingRef.current = true;
    setSaving(true);
    setFileError("");
    try {
      onSave(await uploadFile(file, articleApi));
    } catch {
      setFileError(labels.coverUploadFailed);
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const panelStyles = {
    border: `1px dashed ${theme.palette.border.primary}`,
    borderRadius: theme.radius.s,
    p: theme.spaces.m
  };
  const buttonStyles = {
    color: "#222",
    px: theme.spaces.m,
    py: theme.spaces.s,
    borderRadius: theme.radius.s,
    fontSize: 14,
    fontWeight: 600,
    lineHeight: 1.6,
    textTransform: "none",
    bgcolor: theme.palette.buttons.secondaryBg,
    "&:hover": { bgcolor: theme.palette.buttons.secondaryHover }
  };

  return (
    <Dialog
      open
      fullWidth
      maxWidth={false}
      aria-labelledby={titleId}
      onClose={() => {
        if (!savingRef.current) onClose();
      }}
      slotProps={{
        backdrop: { sx: { bgcolor: "rgba(34, 34, 34, 0.25)" } },
        paper: {
          sx: {
            width: 470,
            maxWidth: "calc(100% - 32px)",
            m: 2,
            p: theme.spaces.m,
            borderRadius: theme.radius.s,
            boxShadow: "none",
            backgroundImage: "none"
          }
        }
      }}
    >
      <DialogTitle
        id={titleId}
        sx={{
          p: 0,
          mb: theme.spaces.xl,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          typography: "h4"
        }}
      >
        {labels.addCoverImage}
        <IconButton
          aria-label={labels.closeCoverDialog}
          disabled={saving}
          onClick={onClose}
          sx={{ p: theme.spaces.xs }}
        >
          <img src={closeIcon} alt="" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0, display: "flex", flexDirection: "column", gap: theme.spaces.l }}>
        <Box
          sx={{
            ...panelStyles,
            display: "grid",
            justifyItems: "center",
            textAlign: "center",
            gap: theme.spaces.l,
            bgcolor: dragging ? theme.palette.hover.secondary : undefined
          }}
          onDragOver={(event) => {
            event.preventDefault();
            if (!saving) setDragging(true);
          }}
          onDragLeave={(event) => {
            if (
              !(event.relatedTarget instanceof Node) ||
              !event.currentTarget.contains(event.relatedTarget)
            )
              setDragging(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            selectFile(event.dataTransfer.files[0]);
          }}
        >
          <Typography sx={{ fontSize: 14 }}>{labels.dropCoverImage}</Typography>
          <Button sx={buttonStyles} disabled={saving} onClick={() => fileInput.current?.click()}>
            {labels.browseCoverFiles}
          </Button>
          <input
            ref={fileInput}
            type="file"
            hidden
            accept={acceptedTypes.join(",")}
            onChange={(event) => {
              selectFile(event.currentTarget.files?.[0]);
              event.currentTarget.value = "";
            }}
          />
          <Typography sx={{ fontSize: 10 }}>{labels.coverFileTypes}</Typography>
          {file && (
            <Typography variant="body2" sx={{ overflowWrap: "anywhere" }}>
              {file.name}
            </Typography>
          )}
          {fileError && (
            <Typography role="alert" variant="body2" color="error">
              {fileError}
            </Typography>
          )}
        </Box>

        <Typography align="center" sx={{ fontSize: 14 }}>
          {labels.coverOr}
        </Typography>
        <Box>
          <Typography component="label" htmlFor={urlId} sx={{ fontWeight: 500 }}>
            {labels.coverLinkLabel}
          </Typography>
          <TextField
            id={urlId}
            value={url}
            onChange={(event) => selectUrl(event.target.value)}
            placeholder={labels.coverLinkPlaceholder}
            disabled={saving}
            type="url"
            size="small"
            fullWidth
            sx={{
              mt: theme.spaces.xs,
              "& .MuiOutlinedInput-root": { borderRadius: theme.radius.s, fontSize: 14 },
              "& .MuiOutlinedInput-notchedOutline": { borderColor: theme.palette.border.primary }
            }}
          />
        </Box>

        <Typography align="center" sx={{ fontSize: 14 }}>
          {labels.coverOr}
        </Typography>
        <Box>
          <Typography sx={{ fontWeight: 500, mb: theme.spaces.xs }}>
            {labels.coverGallery}
          </Typography>
          <Box sx={{ ...panelStyles, height: 168, boxSizing: "border-box", overflowY: "auto" }}>
            {galleryError ? (
              <Typography role="alert" variant="body2" color="error">
                {labels.errorLoadingMediaFiles}
              </Typography>
            ) : !mediaFiles ? (
              <CircularProgress size={24} />
            ) : mediaFiles.length === 0 ? (
              <Typography variant="body2">{labels.noFilesFound}</Typography>
            ) : (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(3, minmax(0, 1fr))",
                    sm: "repeat(5, minmax(0, 1fr))"
                  },
                  gap: theme.spaces.s
                }}
              >
                {mediaFiles.map((name) => {
                  const imageUrl = getHttpsUrlFromS3(name);
                  return (
                    <Button
                      key={name}
                      title={name}
                      aria-label={name}
                      aria-pressed={trimmedUrl === imageUrl}
                      disabled={saving}
                      onClick={() => selectUrl(imageUrl)}
                      sx={{
                        minWidth: 0,
                        height: 64,
                        p: 0,
                        overflow: "hidden",
                        borderRadius: theme.radius.xs,
                        backgroundImage: `url("${coverPlaceholder}")`,
                        backgroundSize: "cover",
                        '&[aria-pressed="true"], &:focus-visible': {
                          outline: `2px solid ${theme.palette.border.accent}`,
                          outlineOffset: 1
                        }
                      }}
                    >
                      <Box
                        component="img"
                        src={imageUrl}
                        alt=""
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.style.visibility = "hidden";
                        }}
                        sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </Button>
                  );
                })}
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 0, pt: theme.spaces.xl, justifyContent: "space-between" }}>
        <Button sx={buttonStyles} disabled={saving} onClick={onClose}>
          {labels.cancel}
        </Button>
        <Button
          variant="contained"
          disableElevation
          disabled={!canSave || saving}
          onClick={handleSave}
          sx={{
            ...buttonStyles,
            bgcolor: theme.palette.buttons.primary,
            "&:hover": { bgcolor: theme.palette.buttons.hover },
            "&.Mui-disabled": { bgcolor: theme.palette.buttons.disabledBg }
          }}
        >
          {saving && <CircularProgress size={16} sx={{ mr: 1 }} />}
          {strings.label.save}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CoverImageDialog;
