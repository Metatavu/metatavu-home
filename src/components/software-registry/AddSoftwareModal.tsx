import CloseIcon from "@mui/icons-material/Close";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  Modal,
  Snackbar,
  TextField,
  Typography
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import type { SoftwareRegistry, User } from "src/generated/homeLambdasClient";
import { useLambdasApi } from "src/hooks/use-api";
import strings from "src/localization/strings";
import { isValidHttpUrl, isValidImageUrl } from "src/utils/url-validators";

/**
 * AddSoftwareModal component props
 */
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
 * This component renders a modal dialog for adding or editing a software entry.
 * It provides form fields for software entry.
 *
 * @param {AddSoftwareModalProps} props - The props for the AddSoftwareModal component.
 * @returns The rendered modal component.
 */
const AddSoftwareModal = ({
  open,
  handleClose,
  handleSave,
  disabled,
  softwareData,
  existingSoftwareList
}: AddSoftwareModalProps) => {
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
  const [userList, setUserList] = useState<User[]>([]);
  const [software, setSoftware] = useState<SoftwareRegistry>(softwareData || initialSoftwareState);
  const [tags, setTags] = useState("");
  const [nameExists, setNameExists] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const errorRef = useRef<string | null>(null);
  /**
   * Fetch the list of users when the modal opens.
   */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await usersApi.listUsers();
        setUserList(users);
      } catch (err: unknown) {
        errorRef.current = `${strings.error.fetchFailedGeneral}: ${err}`;
        console.error(errorRef.current);
      }
    };

    if (open) {
      fetchUsers();
    }
  }, [open, usersApi]);

  /**
   * Check if the software name already exists in the list of existing software but ignoring its own name when editing.
   */
  useEffect(() => {
    const nameAlreadyExists = existingSoftwareList.some(
      (item) =>
        item.id !== software.id && item.name.toLowerCase() === software.name.toLowerCase().trim()
    );
    setNameExists(nameAlreadyExists);
  }, [software.name, existingSoftwareList]);

  /**
   * Handle form field reset to initial values.
   */
  const resetForm = () => {
    setSoftware(initialSoftwareState);
    setTags("");
    setNameExists(false);
  };

  /**
   * Handle form field changes by updating the software state.
   *
   * @param e - The change event for form inputs.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSoftware({ ...software, [name]: value });
  };

  /**
   * Handle adding a tag to the software entry. Prevents duplicates.
   */
  const handleAddTag = () => {
    if (tags.trim() !== "") {
      setSoftware((prev) => ({
        ...prev,
        tags: [...new Set([...(prev.tags || []), tags.trim()])]
      }));
      setTags("");
    }
  };

  /**
   * Handle deleting a tag.
   */
  const handleDeleteTag = (tagToDelete: string) => {
    setSoftware((prev) => ({
      ...prev,
      tags: (prev.tags || []).filter((tag) => tag !== tagToDelete)
    }));
  };

  /**
   * Handle submitting the software data. If the name doesn't already exist, it saves the data.
   */
  const handleSubmit = async () => {
    if (nameExists) {
      setErrorMessage(strings.softwareRegistry.alreadyExists);
      setErrorSnackbarOpen(true);
      return;
    }

    if (!isValidHttpUrl(software.url)) {
      setErrorMessage(strings.snackbar.correctUrl);
      setErrorSnackbarOpen(true);
      return;
    }

    const isImageValid =
      (isValidHttpUrl(software.image) && (await isValidImageUrl(software.image))) || false;

    if (!isImageValid) {
      setErrorMessage(strings.snackbar.correctImageUrl);
      setErrorSnackbarOpen(true);
      return;
    }
    handleSave(software);
    setSnackbarOpen(true);
    resetForm();
    handleClose();
  };

  const isFormValid = Boolean(software.name.trim() && software.image.trim() && software.url.trim());

  const hiddenTagsCount = Math.max(0, (software?.tags?.length ?? 0) - 3);

  return (
    <>
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
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
          }}
        >
          <IconButton
            onClick={() => {
              handleClose();
            }}
            sx={{ position: "absolute", top: 16, right: 16 }}
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" marginBottom={4}>
            {strings.softwareRegistry.addSoftware}
          </Typography>
          <Grid container spacing={2} sx={{ flexGrow: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={strings.softwareRegistry.name}
                name="name"
                value={software.name}
                onChange={handleChange}
                required
                error={nameExists}
                helperText={
                  nameExists
                    ? strings.softwareRegistry.alreadyExists
                    : strings.softwareRegistry.nameRequired
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={strings.softwareRegistry.imageURL}
                name="image"
                value={software.image}
                onChange={handleChange}
                required
                helperText={strings.softwareRegistry.imageURLRequired}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={strings.softwareRegistry.URLAddress}
                name="url"
                value={software.url}
                onChange={handleChange}
                required
                helperText={strings.softwareRegistry.URLExample}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label={strings.softwareRegistry.tags}
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
              />
              <Box
                mt={1}
                display="flex"
                justifyContent="space-between"
                alignItems="flex-start"
                flexWrap="wrap"
                gap={1}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  flexWrap="wrap"
                  gap={1}
                  maxWidth="calc(100% - 100px)"
                >
                  {(software.tags || []).slice(0, 3).map((tag) => (
                    <Chip key={tag} label={tag} onDelete={() => handleDeleteTag(tag)} />
                  ))}
                  {hiddenTagsCount > 0 && (
                    <Chip
                      size="small"
                      label={strings.formatString(
                        strings.questionnaireTags.moreCount,
                        hiddenTagsCount
                      )}
                      sx={{
                        flexShrink: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.08)",
                        "&:hover": {
                          backgroundColor: "rgba(0, 0, 0, 0.12)"
                        }
                      }}
                    />
                  )}
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddTag}
                  size="small"
                  sx={{
                    height: "40px",
                    minWidth: "90px",
                    flexShrink: 0,
                    marginTop: "8px",
                    display: "block",
                    fontSize: "16px",
                    backgroundColor: "#212121",
                    "&:hover": {
                      backgroundColor: "#000000"
                    }
                  }}
                >
                  {strings.questionnaireTags.addTag}
                </Button>
              </Box>
            </Grid>
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
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={userList.filter((user) => user.firstName && user.lastName)}
                getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
                filterSelectedOptions
                value={userList.filter((user) => software.recommend?.includes(user.id))}
                onChange={(_, newValue) => {
                  setSoftware((prev) => ({
                    ...prev,
                    recommend: newValue.map((user) => user.id)
                  }));
                }}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    // biome-ignore lint/correctness/useJsxKeyInIterable: false positive, getTagProps provides key
                    <Chip
                      label={`${option.firstName} ${option.lastName}`}
                      {...getTagProps({ index })}
                    />
                  ))
                }
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>
                    {`${option.firstName} ${option.lastName}`}
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={strings.softwareRegistry.recommend}
                    placeholder={strings.softwareRegistry.searchPlaceholder}
                  />
                )}
              />
            </Grid>
            <Grid item container justifyContent="right" xs={12} mt={4}>
              <Button
                onClick={() => {
                  handleClose();
                }}
                variant="outlined"
                sx={{
                  marginRight: "4px",
                  textTransform: "none",
                  borderRadius: "25px",
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#000",
                  borderColor: "#000",
                  "&:hover": {
                    borderColor: "#000",
                    backgroundColor: "#f0f0f0"
                  }
                }}
              >
                {strings.softwareRegistry.cancel}
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleSubmit}
                sx={{
                  marginLeft: "4px",
                  textTransform: "none",
                  color: "#fff",
                  fontSize: "18px",
                  borderRadius: "25px",
                  "&:hover": { background: "#000" }
                }}
                disabled={disabled || nameExists || !isFormValid}
              >
                {strings.softwareRegistry.submit}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Modal>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        sx={{
          "& .MuiSnackbarContent-root": {
            minWidth: 400,
            minHeight: 100,
            fontSize: "1.5rem",
            borderRadius: "16px"
          }
        }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          sx={{
            width: "100%",
            fontSize: "1.5rem",
            py: 3,
            px: 4,
            borderRadius: "14px"
          }}
        >
          {strings.softwareRegistry.addedSuccessfully}
        </Alert>
      </Snackbar>
      <Snackbar
        open={errorSnackbarOpen}
        autoHideDuration={4000}
        onClose={() => setErrorSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        sx={{
          "& .MuiSnackbarContent-root": {
            minWidth: 400,
            minHeight: 100,
            fontSize: "1.5rem",
            borderRadius: "16px"
          }
        }}
      >
        <Alert
          onClose={() => setErrorSnackbarOpen(false)}
          severity="error"
          sx={{
            width: "100%",
            fontSize: "1.5rem",
            py: 3,
            px: 4,
            borderRadius: "14px"
          }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddSoftwareModal;
