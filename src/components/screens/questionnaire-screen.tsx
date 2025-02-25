import { Card, Grid } from "@mui/material";
import { Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";
import UserRoleUtils from "src/utils/user-role-utils";
import { KeyboardReturn } from "@mui/icons-material";
import strings from "src/localization/strings";
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
    <Card sx={{ mt: 2, width: "100%" }}>
        <Link to={adminMode ? "/admin" : "/"} style={{ textDecoration: "none" }}>
          <Button variant="contained" sx={{ p: 2, width: "100%" }}>
            <KeyboardReturn sx={{ marginRight: "10px" }} />
            <Typography>{strings.questionnaireScreen.back}</Typography>
          </Button>
        </Link>
    </Card>
    </>
    
  );
};

export default QuestionnaireScreen;
