import { Delete } from "@mui/icons-material";
import { Button, Typography, useTheme } from "@mui/material";
import strings from "src/localization/strings";

/**
 * Component properties
 */
interface Props {
  setConfirmationHandlerOpen: (confirmation: boolean) => void;
}

/**
 * Delete Button component
 *
 * @param props component properties
 */
const ToolbarDeleteButton = ({ setConfirmationHandlerOpen }: Props) => {
  const theme = useTheme();
  return (
    <Button
      variant="contained"
      sx={{
        width: "100%",
        backgroundColor: theme.palette.error.main,
        color: theme.palette.error.contrastText,
        "&:hover": {
          backgroundColor: theme.palette.error.dark
        }
      }}
      onClick={() => {
        setConfirmationHandlerOpen(true);
      }}
    >
      <Delete />
      <Typography variant="body1" marginLeft={1}>
        {strings.tableToolbar.delete}
      </Typography>
    </Button>
  );
};

export default ToolbarDeleteButton;
