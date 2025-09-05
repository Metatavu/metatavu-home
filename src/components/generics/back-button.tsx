import { Link, useLocation, useNavigation } from "react-router-dom";
import { Button, Typography, SxProps } from "@mui/material";
import KeyboardReturn from "@mui/icons-material/KeyboardReturn";
import strings from "src/localization/strings";

interface BackButtonProps {
  sx?: SxProps;
}

const BackButton = ({ sx }: BackButtonProps) => {
  const location = useLocation();
  const navigation = useNavigation();
/*** Check path to see user type */
  const isAdminPath = location.pathname.startsWith("/admin");
  const pathSegments = location.pathname.split("/").filter(Boolean);

  const moduleName: keyof typeof strings | undefined = isAdminPath
    ? (pathSegments[1] as keyof typeof strings)
    : (pathSegments[0] as keyof typeof strings);

  /*** lookup strings to check for "back" */
  const label = (() => {
    if (!moduleName) return "Back";

    const page = (strings as any)[moduleName];
    if (page && typeof page === "object" && typeof page.back === "string") {
      return page.back;
    }

    return "Back";
  })();

  /*** Using template literal to work out previous page based on current path*/
  const parentSegments = [...pathSegments];
  parentSegments.pop();
  let destination = `/${parentSegments.join("/")}`;
  if (destination === "") destination = isAdminPath ? "/admin" : "/";

  const isNavigating = navigation.state !== "idle";

  return (
    <Link to={destination} style={{ textDecoration: "none" }}>
      <Button
        variant="contained"
        disabled={isNavigating}
        sx={{
          mt: 3,
          padding: "10px",
          width: "100%",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          "&:hover": {
            transform: "translateX(-3px)",
            boxShadow: 3,
          },
          "&:active": {
            transform: "translateX(-1px) scale(0.98)",
          },
          ...sx,
        }}
      >
        <KeyboardReturn sx={{ marginRight: "10px" }} />
        <Typography>{label}</Typography>
      </Button>
    </Link>
  );
};

export default BackButton;
