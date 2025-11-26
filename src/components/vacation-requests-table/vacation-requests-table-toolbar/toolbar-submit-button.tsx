import { Send } from "@mui/icons-material";
import { Button, Typography } from "@mui/material";
import strings from "src/localization/strings";

/**
 * Component properties
 */
interface Props {
  onClick: () => void;
}

/**
 * Submit Button component
 *
 * @param props component properties
 */
const ToolbarSubmitButton = ({ onClick }: Props) => (
  <Button
    variant="contained"
    sx={{
      width: "100%",
      backgroundColor: "#2196f3",
      "&:hover": {
        backgroundColor: "#1976d2"
      }
    }}
    onClick={onClick}
  >
    <Send />
    <Typography variant="body1" marginLeft={1}>
      {strings.tableToolbar.submitforApproval}
    </Typography>
  </Button>
);

export default ToolbarSubmitButton;
