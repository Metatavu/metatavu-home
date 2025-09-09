import { Link, useLocation, useNavigation } from "react-router-dom";
import { Button, Typography } from "@mui/material";
import type { SxProps } from "@mui/material";
import KeyboardReturn from "@mui/icons-material/KeyboardReturn";
import strings from "src/localization/strings";
import { urlToStringsKeyMap } from "./url-to-strings-mapper";

interface BackButtonProps {
  sx?: SxProps;
  to?: string;
}

/**
 * Returns the localized "Back" label for a given module key 
 * which also allows the translation to function properly.
 *
 * @param moduleKey - A key from the `strings` object or null
 */
const getBackLabel = (moduleKey: keyof typeof strings | null): string => {
  if (!moduleKey) return "Back";

  const page = strings[moduleKey];
  const pageObj = typeof page === 'object' &&page !== null;
  const incBack = pageObj && "back" in page;

  return incBack ? (page as { back: string }).back : "Back";
};

/**
 * Generic styled back button that redirects browser using parent route
 * 
 * @param props - Component props
 * @param props.sx - Optional MUI styling override
 * @param props.to - Allows destination override if required
 */
const BackButton = ({ sx, to }: BackButtonProps) => {
  const location = useLocation();
  const navigation = useNavigation();

  const isAdminPath = location.pathname.startsWith("/admin");
  const pathSegments = location.pathname.split("/").filter(Boolean);

  const moduleKey: keyof typeof strings | null =
    urlToStringsKeyMap[location.pathname] ?? null;

  const label = getBackLabel(moduleKey);

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
