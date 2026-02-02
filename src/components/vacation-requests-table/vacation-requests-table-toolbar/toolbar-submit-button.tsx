import { Send } from "@mui/icons-material";
import { Button, Typography, useTheme } from "@mui/material";
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
const ToolbarSubmitButton = ({ onClick }: Props) => {
  const theme = useTheme();
  return (
    <Button
      variant="contained"
      sx={{
        width: "100%",
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        "&:hover": {
          backgroundColor: theme.palette.primary.dark
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
};

export default ToolbarSubmitButton;
