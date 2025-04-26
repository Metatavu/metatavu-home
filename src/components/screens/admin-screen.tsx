import { Grid } from "@mui/material";
import BalanceCard from "../home/balance-card";
import VacationsCard from "../home/vacations-card";
import SprintViewCard from "../home/sprint-view-card";
import UserRoleUtils from "src/utils/user-role-utils";
import QuestionnaireCard from "../home/questionnaire-card";
import WikiDocumentationCard from "../home/wiki-documentation-card";

/**
 * Admin screen component
 */
const AdminScreen = () => {
  const developerMode = UserRoleUtils.developerMode();
  const balanceCard = developerMode ? <BalanceCard /> : null;
  const sprintViewCard = developerMode ? <SprintViewCard /> : null;
  const vacationsCard = developerMode ? <VacationsCard /> : null;
  const questionairesCard = developerMode ? <QuestionnaireCard /> : null;
  const wikiDocumentationCard = developerMode ? <WikiDocumentationCard/> : null;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            {balanceCard}
          </Grid>
          <Grid item xs={12}>
            {sprintViewCard}
          </Grid>
          <Grid item xs={12}>
            {questionairesCard}
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            {vacationsCard}
          </Grid>
          <Grid item xs={12}>
            {wikiDocumentationCard}
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default AdminScreen;
