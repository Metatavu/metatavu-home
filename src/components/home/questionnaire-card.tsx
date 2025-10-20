import { Box, Card, CardContent, Grid, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import useUserRole from "src/hooks/use-user-role";
import strings from "src/localization/strings";
import QuestionnaireProgress from "./questionnaire-progress";

/**
 * Component for displaying questionnaire card
 */
const QuestionnaireCard = () => {
  const { adminMode } = useUserRole();
  const linkTarget = adminMode ? "/admin/questionnaire" : "/questionnaire";

  /**
   * Render card content
   */
  const renderCardContent = () => {
    if (adminMode) {
      return (
        <CardContent>
          <Typography variant="h6" fontWeight={"bold"} style={{ marginTop: 6, marginBottom: 3 }}>
            {strings.questionnaireCard.questionnairesBuilder}
          </Typography>
        </CardContent>
      );
    }

    return (
      <CardContent>
        <Typography variant="h6" fontWeight={"bold"} style={{ marginTop: 6, marginBottom: 3 }}>
          {strings.questionnaireProgress.title}
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
