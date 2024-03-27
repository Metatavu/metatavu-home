import { Grid } from "@mui/material";
import BalanceCard from "../home/balance-card";
import VacationsCard from "../home/vacations-card";
import SprintViewCard from "../home/sprint-view-card";

/**
 * Admin screen component
 */
const AdminScreen = () => (
  <Grid container spacing={2}>
    <Grid item xs={12} sm={6}>
      <BalanceCard />
      <Grid item xs={12} style={{ marginTop: "16px" }}>
        <SprintViewCard />
      </Grid>
    </Grid>
    <Grid item xs={12} sm={6}>
      <VacationsCard />
    </Grid>
  </Grid>
);

export default AdminScreen;
