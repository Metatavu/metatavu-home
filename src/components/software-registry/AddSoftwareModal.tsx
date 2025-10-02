import { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Chip,
  IconButton,
  Autocomplete,
  Snackbar,
  Alert
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import strings from "src/localization/strings";
import type { SoftwareRegistry, User } from "src/generated/homeLambdasClient";
import { useLambdasApi } from "src/hooks/use-api";

interface AddSoftwareModalProps {
  open: boolean;
  handleClose: () => void;
  handleSave: (software: SoftwareRegistry) => void;
  disabled: boolean;
  softwareData?: SoftwareRegistry;
  existingSoftwareList: SoftwareRegistry[];
}

/**
 * AddSoftwareModal component.
 * Renders a modal dialog for adding or editing a software entry.
 * Includes form fields, tags, recommended users, and submit/cancel actions.
 *
 * @param props - The AddSoftwareModal props.
 * @returns JSX.Element
 */
function AddSoftwareModal({
  open,
  handleClose,
  handleSave,
  disabled,
  softwareData,
  existingSoftwareList
}: AddSoftwareModalProps) {
  const initialSoftwareState: SoftwareRegistry = {
    id: "",
    name: "",
    description: "",
    review: "",
    url: "",
    image: "",
    createdBy: "",
    lastUpdatedBy: "",
    recommend: [],
    tags: [],
    users: []
  };

  const { usersApi } = useLambdasApi();

  const [software, setSoftware] = useState<SoftwareRegistry>(softwareData || initialSoftwareState);
  const [tags, setTags] = useState("");
  const [userList, setUserList] = useState<User[]>([]);
  const [nameExists, setNameExists] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [_error, setError] = useState<string | null>(null);

  /**
   * Helper function to validate URLs.
   *
   * @param value - The URL string to validate
   * @returns boolean indicating whether the URL is valid
   */
  const isValidUrl = useCallback((value: string) => {
    try { new URL(value); return true; } catch { return false; }
  }, []);

  /**
   * Handle form field reset to initial values.
   */
  const resetForm = useCallback(() => {
    setSoftware(initialSoftwareState);
    setTags("");
    setNameExists(false);
  }, []);

  /**
   * Handle form field changes by updating the software state.
   *
   * @param e - The change event for form inputs.
   */
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSoftware(prev => ({ ...prev, [name]: value }));
  }, []);

  /**
   * Handle adding a tag to the software entry. Prevents duplicates.
   */
  const handleAddTag = useCallback(() => {
    const tag = tags.trim();
    if (!tag) return;
    setSoftware(prev => ({ ...prev, tags: [...new Set([...(prev.tags || []), tag])] }));
    setTags("");
  }, [tags]);

  /**
   * Handle deleting a tag from the software entry.
   *
   * @param tagToDelete - The tag string to remove
   */
  const handleDeleteTag = useCallback((tagToDelete: string) => {
    setSoftware(prev => ({ ...prev, tags: (prev.tags || []).filter(tag => tag !== tagToDelete) }));
  }, []);

  /**
   * Handle submitting the software data. Minor URL validation performed.
   * If the name doesn't already exist, it saves the data.
   */
  const handleSubmit = useCallback(() => {
    if ((software.url && !isValidUrl(software.url)) || (software.image && !isValidUrl(software.image))) return;
    if (!nameExists) {
      handleSave(software);
      setSnackbarOpen(true);
      resetForm();
      handleClose();
    }
  }, [software, nameExists, handleSave, handleClose, isValidUrl, resetForm]);

  /**
   * Fetch the list of users when the modal opens.
   */
  useEffect(() => {
    if (!open) return;
    const fetchUsers = async () => {
      try {
        const users = await usersApi.listUsers();
        setUserList(users);
      } catch (error) {
        setError(`${strings.error.fetchFailedGeneral}: ${error}`);
      }
    };
    fetchUsers();
  }, [open, usersApi]);

  /**
   * Check if the software name already exists in the list of existing software but ignoring its own name when editing.
   */
  useEffect(() => {
    const exists = existingSoftwareList.some(
      item => item.id !== software.id && item.name.toLowerCase() === software.name.toLowerCase().trim()
    );
    setNameExists(exists);
  }, [software.name, existingSoftwareList, software.id]);

  const isFormValid = Boolean(
    software.name.trim() &&
    software.image.trim() &&
    software.url.trim() &&
    isValidUrl(software.image) &&
    isValidUrl(software.url)
  );

  const hiddenTagsCount = Math.max(0, (software.tags?.length ?? 0) - 3);

  /**
   * Render the tags as chips
   */
  const renderTags = useCallback(() => {
    const displayedTags = (software.tags || []).slice(0, 3);
    return (
      <>
        {displayedTags.map(tag => <Chip key={tag} label={tag} onDelete={() => handleDeleteTag(tag)} />)}
        {hiddenTagsCount > 0 && (
          <Chip
            size="small"
            label={strings.formatString(strings.questionnaireTags.moreCount, hiddenTagsCount)}
            sx={{ flexShrink: 0, backgroundColor: "rgba(0,0,0,0.08)", "&:hover": { backgroundColor: "rgba(0,0,0,0.12)" } }}
          />
        )}
      </>
    );
  }, [software.tags, hiddenTagsCount, handleDeleteTag]);

  /**
   * Render recommended users autocomplete
   */
  const renderUserAutocomplete = useCallback(() => (
    <Autocomplete
      multiple
      options={userList.filter(u => u.firstName && u.lastName)}
      getOptionLabel={option => `${option.firstName} ${option.lastName}`}
      filterSelectedOptions
      value={userList.filter(u => software.recommend?.includes(u.id))}
      onChange={(_, newValue) => setSoftware(prev => ({ ...prev, recommend: newValue.map(u => u.id) }))}
      renderTags={(value, getTagProps) => value.map((option, index) => <Chip label={`${option.firstName} ${option.lastName}`} {...getTagProps({ index })} />)}
      renderOption={(props, option) => <li {...props} key={option.id}>{`${option.firstName} ${option.lastName}`}</li>}
      renderInput={params => <TextField {...params} label={strings.softwareRegistry.recommend} placeholder={strings.softwareRegistry.searchPlaceholder} />}
    />
  ), [userList, software.recommend]);

  return (
    <>
      <Modal open={open} onClose={handleClose}>
        <Box sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90%", sm: "80%", md: "60%" },
          maxWidth: 900,
          bgcolor: "background.paper",
          borderRadius: "10px",
          boxShadow: 24,
          p: 4,
          overflowY: "auto"
        }}>
          <IconButton onClick={handleClose} sx={{ position: "absolute", top: 16, right: 16 }}>
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" marginBottom={4}>{strings.softwareRegistry.addSoftware}</Typography>
          <Grid container spacing={2}>
            {/* Name */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={strings.softwareRegistry.name}
                name="name"
                value={software.name}
                onChange={handleChange}
                required
                error={Boolean(nameExists)}
                helperText={nameExists ? strings.softwareRegistry.alreadyExists : strings.softwareRegistry.nameRequired}
              />
            </Grid>

            {/* Image URL */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={strings.softwareRegistry.imageURL}
                name="image"
                value={software.image}
                onChange={handleChange}
                required
                error={Boolean(software.image && !isValidUrl(software.image))}
                helperText={software.image && !isValidUrl(software.image) ? strings.softwareRegistry.URLFalse : strings.softwareRegistry.imageURLRequired}
              />
            </Grid>

            {/* Software URL */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={strings.softwareRegistry.URLAddress}
                name="url"
                value={software.url}
                onChange={handleChange}
                required
                error={Boolean(software.url && !isValidUrl(software.url))}
                helperText={software.url && !isValidUrl(software.url) ? strings.softwareRegistry.URLFalse : strings.softwareRegistry.URLExample}
              />
            </Grid>

            {/* Tags */}
            <Grid item xs={6}>
              <TextField
                fullWidth
                label={strings.softwareRegistry.tags}
                value={tags}
                onChange={e => setTags(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAddTag()}
              />
              <Box mt={1} display="flex" justifyContent="space-between" flexWrap="wrap" gap={1}>
                <Box display="flex" alignItems="center" flexWrap="wrap" gap={1} maxWidth="calc(100% - 100px)">
                  {renderTags()}
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddTag}
                  size="small"
                  sx={{ height: 40, minWidth: 90, flexShrink: 0, marginTop: "8px", fontSize: 16, backgroundColor: "#212121", "&:hover": { backgroundColor: "#000" } }}
                >
                  {strings.questionnaireTags.addTag}
                </Button>
              </Box>
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={strings.softwareRegistry.description}
                name="description"
                value={software.description}
                onChange={handleChange}
                multiline
                rows={4}
              />
            </Grid>

            {/* Review */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={strings.softwareRegistry.ownReview}
                name="review"
                value={software.review}
                onChange={handleChange}
                multiline
                rows={2}
              />
            </Grid>

            {/* Recommend users */}
            <Grid item xs={12}>{renderUserAutocomplete()}</Grid>

            {/* Buttons */}
            <Grid item container justifyContent="right" xs={12} mt={4}>
              <Button onClick={handleClose} variant="outlined" sx={{ marginRight: 1, borderRadius: 2, fontSize: 18 }}>
                {strings.softwareRegistry.cancel}
              </Button>
              <Button onClick={handleSubmit} variant="contained" color="secondary" disabled={disabled || nameExists || !isFormValid} sx={{ marginLeft: 1, borderRadius: 2, fontSize: 18 }}>
                {strings.softwareRegistry.submit}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Modal>

      {/* Snackbar */}
      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: "100%", fontSize: "1.5rem", py: 3, px: 4, borderRadius: "14px" }}>
          {strings.softwareRegistry.addedSuccessfully}
        </Alert>
      </Snackbar>
    </>
  );
}

export default AddSoftwareModal;
