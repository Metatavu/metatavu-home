import { Typography } from "@mui/material";
import strings from "src/localization/strings";

/**
 * Sprint card component for admin
 */
const AdminSprintViewCard = () => {
  return <Typography variant="body1">{strings.sprint.viewAllSprints}</Typography>;
};

export default AdminSprintViewCard;
