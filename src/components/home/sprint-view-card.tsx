import { Card, CardContent, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import strings from "../../localization/strings";
import UserRoleUtils from "../../utils/user-role-utils";

/**
 * SprintView card component
 */
const SprintViewCard = () => {
  const adminMode = UserRoleUtils.adminMode();
  
  return (
    <Link
      to={adminMode ? "/admin/sprintview" : "/sprintview"}
      style={{ textDecoration: "none" }}
    >
      <Card
        sx={{
          "&:hover": {
            background: "#efefef"
          }
        }}
      >
        {adminMode ? (
          <CardContent>
            <Typography 
              variant="h6" 
              fontWeight={"bold"} 
              style={{ marginTop: 6, marginBottom: 3 }}
            >
              {strings.sprint.sprintview}
            </Typography>
            <Typography variant="body1">{ strings.placeHolder.notYetImplemented }</Typography>
          </CardContent>
        ) : (
          <CardContent>
            <Typography 
              variant="h6" 
              fontWeight={"bold"} 
              style={{ marginTop: 6, marginBottom: 3 }}
            >
              {strings.sprint.sprintview}
            </Typography>
            <Typography variant="body1">{ strings.placeHolder.notYetImplemented }</Typography>
          </CardContent>
        )}
      </Card>
    </Link>
  );
}

export default SprintViewCard;