import { Grid } from "@mui/material";
import BalanceCard from "../home/balance-card";
import VacationsCard from "../home/vacations-card";
import SprintViewCard from "../home/sprint-view-card";
import OnCallCard from "../home/oncall-card";

/**
 * Home screen component
 */
const HomeScreen = () => {
  return (
    <Grid container spacing={2}>

      <Grid item xs={12} sm={6}>
        <BalanceCard />
        <Grid item xs={12} style={{ marginTop: "16px" }}>
          <SprintViewCard />
        </Grid>
        
      </Grid>

      <Grid item xs={12} sm={6}>
        <VacationsCard />
        <Grid item xs={12} style={{ marginTop: "16px" }}>
          <OnCallCard/>
        </Grid>
      </Grid>
      
    </Grid>
  );
};

export default HomeScreen;
