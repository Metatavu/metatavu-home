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
  Typography,
  useTheme
} from "@mui/material";
import { useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { errorAtom } from "src/atoms/error";
import type { SoftwareRegistry, User } from "src/generated/homeLambdasClient";
import { useLambdasApi } from "src/hooks/use-api";
import strings from "src/localization/strings";

/**
 * AddSoftwareModal component props
 */
interface SoftwareModalProps {
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
 * @param {SoftwareModalProps} props - The props for the AddSoftwareModal component.
 * @returns The rendered modal component.
 */
const SoftwareModal = ({
  open,
  handleClose,
  handleSave,
  disabled,
  softwareData,
  existingSoftwareList
}: SoftwareModalProps) => {
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
  const setError = useSetAtom(errorAtom);
  const [userList, setUserList] = useState<User[]>([]);
  const [software, setSoftware] = useState<SoftwareRegistry>(initialSoftwareState);
  const [tags, setTags] = useState("");
  const [nameExists, setNameExists] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const theme = useTheme();

  /**
   * Fetch the list of users when the modal opens.
   */
  useEffect(() => {
    if (softwareData) {
      setSoftware(softwareData);
    } else {
      setSoftware(initialSoftwareState);
    }
  }, [softwareData]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await usersApi.listUsers();
        setUserList(users);
      } catch (error) {
        setError(`${strings.error.fetchFailedGeneral}: ${error}`);
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
    if (!softwareData) {
      setSoftware(initialSoftwareState);
    }
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
  const handleSubmit = () => {
    if (!nameExists) {
      handleSave(software);
      setSnackbarOpen(true);
      resetForm();
      handleClose();
    }
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
            bgcolor: theme.palette.background.paper,
            borderRadius: "10px",
            boxShadow: theme.shadows[24],
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
            {softwareData
              ? strings.softwareRegistry.editApplication
              : strings.softwareRegistry.addApplication}
          </Typography>
          <Grid container spacing={2} sx={{ flexGrow: 1 }}>
            <Grid
              size={{
                xs: 12,
                md: 6
              }}
            >
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
            <Grid
              size={{
                xs: 12,
                md: 6
              }}
            >
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
            <Grid
              size={{
                xs: 12,
                md: 6
              }}
            >
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
            <Grid size={6}>
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
                        backgroundColor: theme.palette.action.selected,
                        "&:hover": {
                          backgroundColor: theme.palette.action.hover
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
                    backgroundColor: theme.palette.primary.main,
                    "&:hover": {
                      backgroundColor: theme.palette.primary.dark
                    }
                  }}
                >
                  {strings.questionnaireTags.addTag}
                </Button>
              </Box>
            </Grid>
            <Grid size={12}>
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
            <Grid size={12}>
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
            <Grid size={12}>
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
                  value.map((option, index) => {
                    const { key, ...tagProps } = getTagProps({ index });
                    return (
                      <Chip
                        key={key}
                        label={`${option.firstName} ${option.lastName}`}
                        {...tagProps}
                      />
                    );
                  })
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
            <Grid container justifyContent="right" mt={4} size={12}>
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
                  color: theme.palette.text.primary,
                  borderColor: theme.palette.text.primary,
                  "&:hover": {
                    borderColor: theme.palette.text.primary,
                    backgroundColor: theme.palette.action.hover
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
                  fontSize: "18px",
                  borderRadius: "25px",
                  "&:hover": { backgroundColor: theme.palette.secondary.dark }
                }}
                disabled={disabled || nameExists || !isFormValid}
              >
                {softwareData
                  ? strings.softwareRegistry.updateApplication
                  : strings.softwareRegistry.submitApplication}
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
    </>
  );
};

export default SoftwareModal;
