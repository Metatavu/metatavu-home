import { Grid } from "@mui/material";
import BalanceCard from "../home/balance-card";
import VacationsCard from "../home/vacations-card";
import SprintViewCard from "../home/sprint-view-card";
import UserRoleUtils from "src/utils/user-role-utils";
import OnCallCard from "../home/oncall-card";

/**
 * Home screen component
 */
const HomeScreen = () => {
  const developerMode = UserRoleUtils.developerMode();
  const sprintViewCard = developerMode ? <SprintViewCard />:null
  const vacationsCard = developerMode ? <VacationsCard /> : null;
  return (
    <Grid container spacing={2}>

      <Grid item xs={12} sm={6}>
        <BalanceCard />
        <Grid item xs={12} style={{ marginTop: "16px" }}>
          {sprintViewCard}
        </Grid>
        
      </Grid>

      <Grid item xs={12} sm={6}>
        {vacationsCard}
        <Grid item xs={12} style={{ marginTop: "16px" }}>
          <OnCallCard/>
        </Grid>
      </Grid>
      
    </Grid>
  );
};

export default HomeScreen;
