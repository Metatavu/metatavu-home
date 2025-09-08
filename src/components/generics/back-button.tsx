import { Link, useLocation, useNavigation } from "react-router-dom";
import { Button, Typography } from "@mui/material";
import type { SxProps } from "@mui/material";
import KeyboardReturn from "@mui/icons-material/KeyboardReturn";
import strings from "src/localization/strings";
import { useModuleKey } from "src/hooks/useModuleKey";
import { urlToStringsKeyMap } from "./url-to-strings-mapper";

interface BackButtonProps {
  sx?: SxProps;
  to?: string;
}

/**
 * Returns the localized "Back" label for a given module key.
 *
 * @param moduleKey - A key from the `strings` object or null
 */
const getBackLabel = (moduleKey: keyof typeof strings | null): string => {
  if (!moduleKey) return "Back";
  const page = strings[moduleKey];
  if (page && typeof page === "object" && "back" in page && typeof page.back === "string") {
    return page.back;
  }
  return "Back";
};

const BackButton: React.FC<BackButtonProps> = ({ sx, to }) => {
  const location = useLocation();
  const navigation = useNavigation();

  const isAdminPath = location.pathname.startsWith("/admin");
  const pathSegments = location.pathname.split("/").filter(Boolean);

  let moduleKey: keyof typeof strings | null = null;
  try {
    moduleKey = useModuleKey(urlToStringsKeyMap);
  } catch {
    moduleKey = null;
  }

  const label = getBackLabel(moduleKey);
/**
 * Calculates current path and removes parent segment to find destination
 * 
 * @param isAdminPath - True if current path starts with "/admin"
 * @param to - Optional override for destination.
 * 
 */
  const parentSegments = [...pathSegments];
  parentSegments.pop();
  let computedDestination = `/${parentSegments.join("/")}`;
  if (computedDestination === "") computedDestination = isAdminPath ? "/admin" : "/";

  const destination = to ?? computedDestination;

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
