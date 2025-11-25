import { Delete } from "@mui/icons-material";
import { Button, Typography } from "@mui/material";
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
const ToolbarDeleteButton = ({ setConfirmationHandlerOpen }: Props) => (
  <Button
    variant="contained"
    sx={{
      width: "100%",
      backgroundColor: "#333",
      "&:hover": {
        backgroundColor: "#555"
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

export default ToolbarDeleteButton;
