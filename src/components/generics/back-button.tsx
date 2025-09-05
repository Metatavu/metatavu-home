import { Link, useNavigation } from "react-router-dom";
import { Button, Typography, type SxProps } from "@mui/material";
import KeyboardReturn from "@mui/icons-material/KeyboardReturn";
import strings from "src/localization/strings";
import { urlToStringsKeyMap } from "./url-to-strings-mapper";
import { useModuleKey } from "src/hooks/useModuleKey";

interface BackButtonProps {
  sx?: SxProps;
}

const BackButton = ({ sx }: BackButtonProps) => {
  const navigation = useNavigation();

  // Get module key generically
  const moduleKey = useModuleKey(urlToStringsKeyMap);

  // Access localized back label
  const label = (strings as any)[moduleKey].back;

  // Compute parent path
  const pathSegments = window.location.pathname.split("/").filter(Boolean);
  const isAdminPath = window.location.pathname.startsWith("/admin");
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
          "&:hover": { transform: "translateX(-3px)", boxShadow: 3 },
          "&:active": { transform: "translateX(-1px) scale(0.98)" },
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
