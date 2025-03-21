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
import WikiDocumentationCard from "../home/wiki-documentation-card";

/**
 * Home screen component
 */
const HomeScreen = () => {
  const developerMode = UserRoleUtils.developerMode();
  const users = useAtomValue(usersAtom);
  const userProfile = useAtomValue(userProfileAtom);
  const loggedInUser = users.find((user: User) => user.id === userProfile?.id);
  // TODO: Uncomment this code when the optIn feature is ready
  // const isOptIn = loggedInUser?.attributes?.severaUserId;
  // const balanceCard = developerMode && isOptIn ? <BalanceCard /> : null;
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

export default HomeScreen;
