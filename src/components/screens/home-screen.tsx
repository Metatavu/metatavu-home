import { Grid, Skeleton } from "@mui/material";
import BalanceCard from "../home/balance-card";
import QuestionnaireCard from "../home/questionnaire-card";
import VacationsCard from "../home/vacations-card";
import SprintViewCard from "../home/sprint-view-card";
import UserRoleUtils from "src/utils/user-role-utils";
import type { User } from "src/generated/homeLambdasClient";
import { usersAtom } from "src/atoms/user";
import { userProfileAtom } from "src/atoms/auth";
import { useAtomValue } from "jotai";
import strings from "src/localization/strings";

/**
 * Home screen component
 */
const HomeScreen = () => {
  const developerMode = UserRoleUtils.developerMode();
  const users = useAtomValue(usersAtom);
  const userProfile = useAtomValue(userProfileAtom);
  const loggedInUser = users.find((user: User) => user.id === userProfile?.id);
  const hasSeveraUserId = !!loggedInUser?.attributes?.severaUserId;

  const renderCardWithSkeleton = (title: string, content: React.ReactNode) => (
    <Grid
      sx={{
        background: "#f5f5f5",
        borderRadius: 2,
        boxShadow: "0px 2px 8px rgba(0,0,0,0.05)",
        marginBottom: 2,
        minHeight: 120,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start"
      }}
    >
      <Grid sx={{ padding: 2 }}>
        <Grid sx={{ marginBottom: 1, fontWeight: "bold", fontSize: 18 }}>
          {title}
        </Grid>
        {!hasSeveraUserId ? (
          <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 1 }} />
        ) : (
          content
        )}
      </Grid>
    </Grid>
  );

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        {developerMode &&
          renderCardWithSkeleton(
            strings.balanceCard.balance,
            <BalanceCard />
          )}
        <Grid item xs={12} style={{ marginTop: "16px" }}>
          {developerMode &&
            renderCardWithSkeleton(
              strings.sprint.sprintview,
              <SprintViewCard />
            )}
        </Grid>
      </Grid>
      <Grid item xs={12} sm={6}>
        {developerMode &&
          renderCardWithSkeleton(
            strings.vacationsCard.vacations,
            <VacationsCard />
          )}
      </Grid>
      <Grid item xs={12} sm={6}>
        {developerMode &&
          renderCardWithSkeleton(
            strings.questionnaireCard.questionnaires,
            <QuestionnaireCard />
          )}
      </Grid>
    </Grid>
  );
};

export default HomeScreen;
