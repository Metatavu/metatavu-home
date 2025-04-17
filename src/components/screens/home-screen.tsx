import { Grid } from "@mui/material";
import BalanceCard from "../home/balance-card";
import QuestionnaireCard from "../home/questionnaire-card";
import VacationsCard from "../home/vacations-card";
import SprintViewCard from "../home/sprint-view-card";
import UserRoleUtils from "src/utils/user-role-utils";
import type { User } from "src/generated/homeLambdasClient";
import { usersAtom } from "src/atoms/user";
import { userProfileAtom } from "src/atoms/auth";
import { useAtomValue } from "jotai";

/**
 * Home screen component
 */
const HomeScreen = () => {
  
  const users = useAtomValue(usersAtom);
  const userProfile = useAtomValue(userProfileAtom);
  const loggedInUser = users.find((user: User) => user.id === userProfile?.id);
  const severaUserId = loggedInUser?.attributes?.severaUserId;

  const shouldShowCards =  severaUserId;
  
  const balanceCard = shouldShowCards ? <BalanceCard /> : null;
  const sprintViewCard = shouldShowCards ? <SprintViewCard /> : null;
  const vacationsCard = shouldShowCards ? <VacationsCard /> : null;
  const questionairesCard = shouldShowCards ? <QuestionnaireCard /> : null;
  
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        {balanceCard}
        <Grid item xs={12} style={{ marginTop: "16px" }}>
          {sprintViewCard}
        </Grid>
      </Grid>
      <Grid item xs={12} sm={6}>
        {vacationsCard}
      </Grid>
      <Grid item xs={12} sm={6}>
        {questionairesCard}
      </Grid>
    </Grid>
  );
};

export default HomeScreen;
