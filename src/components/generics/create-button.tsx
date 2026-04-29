import { Button, type SxProps, type Theme, Typography } from "@mui/material";
import useUserRole from "src/hooks/use-user-role";
import strings from "src/localization/strings";

/**
 * Props for the CreateButton component.
 * @property {string} [id] - Optional HTML id for the button.
 * @property {() => void} [onClick] - Optional click handler. If not provided, no action is executed.
 * @property {SxProps<Theme>} [styles] - Optional MUI sx styles to extend or override default styles.
 * @property {string} [text] - Optional text label. If not provided, a localized default string ("Create") is used.
 */
interface CreateButtonProps {
  id?: string;
  onClick?: () => void;
  styles?: SxProps<Theme>;
  text?: string;
}
/**
 * Generic create button component properties.
 *
 * @param props.id - Optional HTML id for the button.
 * @param props.onClick - Optional click handler. If not provided, no action is executed.
 * @param props.styles - Optional MUI sx styles to extend or override default styles.
 * @param props.text - Optional text label. If not provided, a localized default string ("Create") is used.
 */
const CreateButton = ({ id, onClick, styles, text }: CreateButtonProps): JSX.Element => {
  const { adminMode } = useUserRole();
  return (
    <Button
      id={id}
      onClick={onClick}
      variant="contained"
      sx={{
        width: {
          lg: "17%",
          md: adminMode ? "17%" : "100%",
          xs: adminMode ? "40%" : "100%"
        },
        height: "55px",
        ...styles
      }}
    >
      <Typography variant={"body1"} marginLeft={1} sx={{ fontWeight: "bold" }}>
        {text || strings.form.create}
      </Typography>
    </Button>
  );
};

export default CreateButton;
