import { Grid, Skeleton, Card, CardContent, Typography } from "@mui/material";
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
  const users = useAtomValue(usersAtom);
  const userProfile = useAtomValue(userProfileAtom);
  const loggedInUser = users.find((user: User) => user.id === userProfile?.id);
  const hasSeveraUserId = !!loggedInUser?.attributes?.severaUserId;

  /**
   * Renders a skeleton placeholder when user hasn't opted in
   *
   * @param title - Title of the card
   * @returns ReactNode containing the skeleton card
   */
  const renderSkeletonCard = (title: string) => (
    <Card
      sx={{
        marginBottom: 2,
        minHeight: 120,
      }}
    >
      <CardContent>
        <Typography variant="h6" fontWeight="bold" sx={{ marginBottom: 2 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ marginBottom: 2 }}>
          {strings.notOptedInDescription.description}
        </Typography>
        <Skeleton variant="rectangular" height={20} sx={{ borderRadius: 1, width: "100%" }} />
      </CardContent>
    </Card>
  );

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        {hasSeveraUserId ? (
          <BalanceCard />
        ) : (
          renderSkeletonCard(strings.balanceCard.balance)
        )}
        
        <Grid item xs={12} style={{ marginTop: "16px" }}>
          {hasSeveraUserId ? (
            <SprintViewCard />
          ) : (
            renderSkeletonCard(strings.sprint.sprintview)
          )}
        </Grid>
      </Grid>
      <Grid item xs={12} sm={6}>
        <VacationsCard />
      </Grid>
      <Grid item xs={12} sm={6}>
        <QuestionnaireCard />
      </Grid>
    </Grid>
  );
};

export default HomeScreen;