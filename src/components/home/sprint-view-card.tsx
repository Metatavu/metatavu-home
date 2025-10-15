import { Card, CardContent, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import strings from "src/localization/strings";
import useUserRole from "src/hooks/use-user-role";
import SprintViewCardContent from "./sprint-view-card-content/user-sprint-view-card";

/**
 * SprintView card component
 */
const SprintViewCard = () => {

  const {adminMode} = useUserRole();

  return (
    <Link to={adminMode ? "/admin/sprintview" : "/sprintview"} style={{ textDecoration: "none" }}>
      <Card sx={{"&:hover": {background: "#efefef"},minHeight:270}}>
        <CardContent>
          <Typography variant="h6" fontWeight={"bold"} style={{ marginTop: 6, marginBottom: "20px" }}>
            {strings.sprint.sprintview}
          </Typography>
          <SprintViewCardContent />
        </CardContent>
      </Card>
    </Link>
  );
}

export default SprintViewCard;