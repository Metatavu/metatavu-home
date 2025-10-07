import { Button, Card, Grid } from "@mui/material";
import { Link } from "react-router-dom";
import strings from "src/localization/strings";
import UserRoleUtils from "src/utils/user-role-utils";
import BackButton from "../generics/back-button";
import QuestionnaireTable from "../questionnaire/questionnaire-table";

/**
 * Questionnaire Screen Component
 */
const QuestionnaireScreen = () => {
  const adminMode = UserRoleUtils.adminMode();

  return (
    <>
      <Card
        sx={{
          p: 2,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          height: "100"
        }}
      >
        <Grid container alignItems="center" justifyContent="flex-end" sx={{ mb: 2 }}>
          {adminMode && (
            <Link to="/admin/newQuestionnaire" style={{ textDecoration: "none" }}>
              <Button variant="contained" color="primary" size="large">
                {strings.questionnaireScreen.buildNewQuestionnaire}
              </Button>
            </Link>
          )}
        </Grid>
        <QuestionnaireTable />
      </Card>
      <BackButton styles={{ mt: 3 }} />
    </>
  );
};

export default QuestionnaireScreen;
