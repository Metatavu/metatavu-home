import { Grid } from "@mui/material";
import BalanceCard from "../home/balance-card";
import VacationsCard from "../home/vacations-card";
import ProjectsCard from "../home/projects-card";

/**
 * Home screen component
 */
const HomeScreen = () => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <BalanceCard />
      </Grid>
      <Grid item xs={12} sm={6}>
        <VacationsCard />
      </Grid>
      <Grid item xs={12} sm={12}>
        <ProjectsCard />
      </Grid>
    </Grid>
  );
};

export default HomeScreen;
