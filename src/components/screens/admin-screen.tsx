// src/components/screens/admin-screen.tsx
import { Grid } from "@mui/material";
import BalanceCard from "../home/balance-card";
import VacationsCard from "../home/vacations-card";
import SprintViewCard from "../home/sprint-view-card";
import UserRoleUtils from "src/utils/user-role-utils";
import QuestionnaireCard from "../home/questionnaire-card";
import VacationManagementCard from "../home/vacation-management-card";

/**
 * Admin screen component
 */
const AdminScreen = () => {
  const developerMode = UserRoleUtils.developerMode();
  const adminMode = UserRoleUtils.adminMode();

  const balanceCard = developerMode ? <BalanceCard /> : null;
  const sprintViewCard = developerMode ? <SprintViewCard /> : null;
  const vacationsCard = developerMode ? <VacationsCard /> : null;
  const questionairesCard = developerMode ? <QuestionnaireCard /> : null;
  const vacationManagementCard = <VacationManagementCard />;

  return (
    <Grid container spacing={2}>
      {/* First row */}
      <Grid item xs={12} sm={6}>
        {balanceCard}
      </Grid>
      <Grid item xs={12} sm={6}>
        {vacationsCard}
      </Grid>
      
      {/* Second row */}
      <Grid item xs={12} sm={6}>
        {sprintViewCard}
      </Grid>
      
      {/* Third row */}
      <Grid item xs={12} sm={6}>
        {questionairesCard}
      </Grid>
      <Grid item xs={12} sm={6}>
        {vacationManagementCard}
      </Grid>
    </Grid>
  );
};

export default AdminScreen;