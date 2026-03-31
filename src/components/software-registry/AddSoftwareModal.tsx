import CloseIcon from "@mui/icons-material/Close";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  Grid,
  IconButton,
  Modal,
  Popper,
  type PopperProps,
  Snackbar,
  styled,
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
  const setError = useSetAtom(errorAtom);
  const [tags, setTags] = useState<string[]>([]);
  const [userList, setUserList] = useState<User[]>([]);
  const [software, setSoftware] = useState<SoftwareRegistry>(softwareData || initialSoftwareState);
  const [tag, setTag] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>(softwareData?.tags || []);
  const [nameExists, setNameExists] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const theme = useTheme();

  /**
   * Fetch the list of users when the modal opens.
   */
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
   * Extract unique tags from the existing software list and set them in the state for the autocomplete options.
   */
  useEffect(() => {
    const allTags = existingSoftwareList.flatMap((s) => s.tags || []);
    setTags([...new Set(allTags)]);
  }, [existingSoftwareList]);

  /**
   * Handle form field reset to initial values.
   */
  const resetForm = () => {
    setSoftware(initialSoftwareState);
    setSelectedTags([]);
    setTag("");
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

  const handleTagChange = (_event: any, value: string) => setTag(value);

  const handleSelectedTagChange = (_event: any, value: string[]) => {
    setSelectedTags(value);
    setSoftware((prev) => ({
      ...prev,
      tags: value
    }));
  };

  const handleEnter = (event: any) => {
    if (event.key !== "Enter") return;
    if (tag && !selectedTags.includes(tag)) {
      const newTags = [...selectedTags, tag];
      setSelectedTags(newTags);
      setSoftware((prev) => ({ ...prev, tags: newTags }));
    }
    setTag("");
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
  const CustomPopper = styled((props: PopperProps) => <Popper {...props} placement="bottom" />)({
    "& .MuiAutocomplete-paper": {
      marginTop: "10px"
    }
  });

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
            {strings.softwareRegistry.addSoftware}
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
            <Grid
              size={{
                xs: 12,
                md: 6
              }}
            >
              <Autocomplete
                multiple
                disableClearable
                freeSolo
                PopperComponent={CustomPopper}
                options={tags}
                sx={{ width: "100%" }}
                inputValue={tag}
                value={selectedTags}
                onInputChange={handleTagChange}
                onChange={handleSelectedTagChange}
                renderInput={(tagProps) => (
                  <TextField
                    {...tagProps}
                    sx={{ width: "100%" }}
                    onKeyDown={handleEnter}
                    label={strings.softwareRegistry.tags}
                  />
                )}
                renderOption={(props, option, { selected }) => (
                  <li
                    {...props}
                    style={{ display: "flex", alignItems: "center" }}
                    key={`tags-option-${option}`}
                  >
                    <Checkbox
                      sx={{
                        marginRight: 2
                      }}
                      checked={selected}
                    />
                    <Box
                      minWidth="5px"
                      style={{ marginRight: "10px" }}
                      component="span"
                      sx={{
                        height: 40,
                        borderRadius: "5px"
                      }}
                    />
                    {option}
                  </li>
                )}
              />
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
    </>
  );
};

export default AddSoftwareModal;
