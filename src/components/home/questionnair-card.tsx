import { Typography, Card, CardContent, Grid } from "@mui/material";
import { Link } from "react-router-dom";
import UserRoleUtils from "src/utils/user-role-utils";

/**
 * Component for displaying question card
 */
const QuestionCard = () => {
	const adminMode = UserRoleUtils.adminMode();

  return (
    <Link
      to={adminMode ? "/admin/questionnaire" : "/questionnaire"}
      style={{ textDecoration: "none" }}
    >
      <Card
        sx={{
          "&:hover": {
            background: "#efefef",
          },
        }}
      >
        {adminMode ? (
          <CardContent>
            <Typography
              variant="h6"
              fontWeight={"bold"}
              style={{ marginTop: 6, marginBottom: 3 }}
            >
              Questionnaires Builder
            </Typography>
          </CardContent>
        ) : (
          <CardContent>
            <Typography
              variant="h6"
              fontWeight={"bold"}
              style={{ marginTop: 6, marginBottom: 3 }}
            >
              Questionnaires
            </Typography>
            <Grid container>
              <Grid item xs={12}>
                Progress bar
              </Grid>
            </Grid>
          </CardContent>
        )}
      </Card>
    </Link>
  );
};

export default QuestionCard;
