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
import type { ReactNode } from "react";

/**
 * Home screen component
 */
const HomeScreen = () => {
  const users = useAtomValue(usersAtom);
  const userProfile = useAtomValue(userProfileAtom);
  const loggedInUser = users.find((user: User) => user.id === userProfile?.id);
  const hasSeveraUserId = !!loggedInUser?.attributes?.severaUserId;

  /**
   * Renders a card with a skeleton loader or content
   *
   * @param title - Title of the card
   * @param content - Content to render inside the card
   * @returns ReactNode containing the card or skeleton
   */
  const renderCardWithSkeleton = (title: string, content: ReactNode) => {
    if (!hasSeveraUserId) {
      return (
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
    }
    return content;
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        {renderCardWithSkeleton(
          strings.balanceCard.balance,
          <BalanceCard />
        )}
        <Grid item xs={12} style={{ marginTop: "16px" }}>
          {renderCardWithSkeleton(
            strings.sprint.sprintview,
            <SprintViewCard />
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