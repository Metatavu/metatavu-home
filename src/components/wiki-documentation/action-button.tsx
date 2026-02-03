import { Button } from "@mui/material";
import { wikiScreenColors } from "src/theme";

const colors = wikiScreenColors;

interface Props {
  children: string | JSX.Element;
  onClick?: () => void;
  disabled?: boolean;
  id?: string;
}
/**
 * A full-width styled MUI Button with custom colors and optional click handler.
 *
 * @param children - Content to display inside the button.
 * @param onClick - Optional function called when the button is clicked.
 * @param id - Optional HTML id attribute for targeting the onboarding step.
 */
const ActionButton = ({ children, disabled, onClick, id }: Props) => (
  <Button
    id={id}
    variant="contained"
    sx={{
      width: "100%",
      backgroundColor: colors.button.main,
      color: colors.button.text,
      cursor: disabled ? "not-allowed" : "pointer",
      "&:hover": {
        backgroundColor: colors.button.hover
      }
    }}
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </Button>
);

export default ActionButton;
