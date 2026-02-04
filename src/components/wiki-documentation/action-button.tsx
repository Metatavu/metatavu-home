import { Button, useTheme } from "@mui/material";

interface Props {
  children: string | JSX.Element;
  onClick?: () => void;
  disabled?: boolean;
}
/**
 * A full-width styled MUI Button with custom colors and optional click handler.
 *
 * @param children - Content to display inside the button.
 * @param onClick - Optional function called when the button is clicked.
 */
const ActionButton = ({ children, disabled, onClick }: Props) => {
  const theme = useTheme();

  return (
    <Button
      variant="contained"
      sx={{
        width: "100%",
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.getContrastText(theme.palette.primary.main),
        cursor: disabled ? "not-allowed" : "pointer",
        "&:hover": {
          backgroundColor: theme.palette.primary.dark,
          color: theme.palette.primary.contrastText
        }
      }}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </Button>
  );
};

export default ActionButton;
