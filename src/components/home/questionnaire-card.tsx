import { Typography, Card, CardContent, Grid, Box } from "@mui/material";
import { Link } from "react-router-dom";
import strings from "src/localization/strings";
import UserRoleUtils from "src/utils/user-role-utils";
import QuestionnaireProgress from "./questionnaire-progress";

/**
 * Component for displaying questionnaire card
 */
const QuestionnaireCard = () => {
  const adminMode = UserRoleUtils.adminMode();
  const linkTarget = adminMode ? "/admin/questionnaire" : "/questionnaire";

  /**
   * Render card content
   */
  const renderCardContent = () => {
    if (adminMode) {
      return (
        <CardContent>
          <Typography variant="h6" fontWeight={"bold"} style={{ marginTop: 6, marginBottom: 3 }}>
            {strings.questionnaireCard?.questionnairesBuilder}
          </Typography>
        </CardContent>
      );
    }

    return (
      <CardContent>
        <Typography variant="h6" fontWeight={"bold"} style={{ marginTop: 6, marginBottom: 3 }}>
          {strings.questionnaireProgress?.title}
        </Typography>
        <Grid container>
          <Box sx={{ width: "100%", display: "flex", flexDirection: "column" }}>
            <QuestionnaireProgress />
          </Box>
        </Grid>
      </CardContent>
    );
  };

  return (
    <Link to={linkTarget} style={{ textDecoration: "none" }}>
      <Card
        sx={{
          "&:hover": {
            background: "#efefef"
          }
        }}
      >
        {renderCardContent()}
      </Card>
    </Link>
  );
};

export default QuestionnaireCard;