import { Grid } from "@mui/material";
import BalanceCard from "../home/balance-card";
import VacationsCard from "../home/vacations-card";
import SprintViewCard from "../home/sprint-view-card";
import UserRoleUtils from "src/utils/user-role-utils";
import QuestionnaireCard from "../home/questionnaire-card";
import SoftwareRegistryCard from "../home/software-registry-card";

/**
 * Admin screen component
 */
const AdminScreen = () => {
  //const developerMode = UserRoleUtils.developerMode();
  const balanceCard = <BalanceCard />;
  const sprintViewCard = <SprintViewCard />;
  const vacationsCard = <VacationsCard /> ;
  const questionairesCard = <QuestionnaireCard /> ;
  const softwareRegistryCard = <SoftwareRegistryCard />;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        {balanceCard}
      </Grid>
      <Grid item xs={12} sm={6}>
        {vacationsCard}
      </Grid>
      <Grid item xs={12} sm={6}>
        {sprintViewCard}
      </Grid>
      <Grid item xs={12} sm={6}>
        {questionairesCard}
      </Grid>
      <Grid item xs={12} sm={6}>
        {softwareRegistryCard}
      </Grid>
    </Grid>
  );
};

export default AdminScreen;
