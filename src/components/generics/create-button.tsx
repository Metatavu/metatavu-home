import { Button, type SxProps, type Theme, Typography, useTheme } from "@mui/material";
import useUserRole from "src/hooks/use-user-role";
import strings from "src/localization/strings";

interface CreateButtonProps {
  id?: string;
  onClick?: () => void;
  styles?: SxProps<Theme>;
  text?: string;
}

const CreateButton = (props: CreateButtonProps): JSX.Element => {
  const { id, onClick, styles, text } = props;
  const theme = useTheme();
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
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        "&:hover": { backgroundColor: theme.palette.action.hover },
        ...styles
      }}
    >
      <Typography variant={"body1"} marginLeft={1} sx={{ fontWeight: "bold" }}>
        {text || strings.wikiDocumentation.create}
      </Typography>
    </Button>
  );
};

export default CreateButton;
