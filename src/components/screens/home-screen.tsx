import { Skeleton, Box, Grid } from "@mui/material";
import CardGridWrapper from "../home/common/card-grid-wrapper";
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
   * Renders a card with a skeleton loader
   *
   * @param content - Content to render inside the card
   * @returns ReactNode containing the card
   */
  const renderCardWithSkeleton = (content: ReactNode) => (
    <Box
      sx={{
        borderRadius: 1,
        minHeight: 120,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start"
      }}
    >
      <Grid sx={{ padding: 2 }}>
        {!hasSeveraUserId ? (
          <>
            <div style={{ color: "#888", fontSize: 15, padding: "12px 0" }}>
              {strings.notOptedInDescription.description}
            </div>
            <Skeleton
              variant="rectangular"
              height={20}
              sx={{ borderRadius: 1, marginTop: 1, width: "100%" }}
            />
          </>
        ) : (
          content
        )}
      </Grid>
    </Box>
  );

  /**
   * Сard collection, new component cards should be added here
   */
  const cards: ReactNode[] = [
    renderCardWithSkeleton(<BalanceCard />),
    renderCardWithSkeleton(<SprintViewCard />),
    <VacationsCard />,
    <QuestionnaireCard />
  ];

  return (
    <CardGridWrapper>
      {cards}
    </CardGridWrapper>
  );
};

export default HomeScreen;
