import { Box, Grid, Skeleton } from "@mui/material";
import { useAtomValue } from "jotai";
import { type ReactNode, useId } from "react";
import { userProfileAtom } from "src/atoms/auth";
import { usersAtom } from "src/atoms/user";
import type { User } from "src/generated/homeLambdasClient";
import useUserRole from "src/hooks/use-user-role";
import strings from "src/localization/strings";
import BalanceCard from "../home/balance-card";
import CardGridWrapper from "../home/common/card-grid-wrapper";
import OnCallCard from "../home/oncall-card";
import QuestionnaireCard from "../home/questionnaire-card";
import SoftwareRegistryCard from "../home/software-registry-card";
import SprintViewCard from "../home/sprint-view-card";
import VacationsCard from "../home/vacations-card";
import WikiDocumentationCard from "../home/wiki-documentation-card";
import Onboarding from "../onboarding/Onboarding";

/**
 * Home screen component
 */
const HomeScreen = () => {
  const { isDeveloper, isTester } = useUserRole();
  const users = useAtomValue(usersAtom);
  const userProfile = useAtomValue(userProfileAtom);
  const loggedInUser = users.find((user: User) => user.id === userProfile?.id);
  const screenId = useId();
  const homeScreenId = useId();
  const onboardingCompleteId = useId();
  const hasSeveraUserId = !!loggedInUser?.attributes?.severaUserId;

  const isPrivilegedUser = isDeveloper || isTester;

  /**
   * Renders a card with a skeleton loader
   *
   * @param title - Title of the card
   * @param content - Content to render inside the card
   * @returns ReactNode containing the card
   */
  const renderCardWithSkeleton = (title: string) => (
    <Box
      sx={{
        background: "#ffffff",
        borderRadius: 1,
        boxShadow: "0px 2px 8px rgba(0,0,0,0.05)",
        minHeight: title === strings.sprint.sprintview ? 270 : 120
      }}
    >
      <Grid sx={{ padding: 2 }}>
        <Box sx={{ fontWeight: "bold", fontSize: 22 }}>{title}</Box>
        <div style={{ color: "#888", fontSize: 15, padding: "12px 0" }}>
          {strings.notOptedInDescription.description}
        </div>
        <Skeleton variant="rectangular" height={20} sx={{ mt: 1 }} />
      </Grid>
    </Box>
  );

  const cards: ReactNode[] = [
    isPrivilegedUser && (
      <Box key="balance" id={`${screenId}-balance-card`}>
        {hasSeveraUserId ? <BalanceCard /> : renderCardWithSkeleton(strings.balanceCard.balance)}
      </Box>
    ),
    isPrivilegedUser && (
      <Box key="sprint" id={`${screenId}-sprint-view-card`}>
        {hasSeveraUserId ? <SprintViewCard /> : renderCardWithSkeleton(strings.sprint.sprintview)}
      </Box>
    ),
    isPrivilegedUser && (
      <Box key="vacations" id={`${screenId}-vacations-card`}>
        <VacationsCard />
      </Box>
    ),
    isPrivilegedUser && (
      <Box key="questionnaires" id={`${screenId}-questionnaires-card`}>
        <QuestionnaireCard />
      </Box>
    ),
    isPrivilegedUser && (
      <Box key="software" id={`${screenId}-software-registry-card`}>
        <SoftwareRegistryCard />
      </Box>
    ),
    isPrivilegedUser && (
      <Box key="wiki" id={`${screenId}-wiki-documentation-card`}>
        <WikiDocumentationCard />
      </Box>
    ),
    isPrivilegedUser && (
      <Box key="oncall" id={`${screenId}-oncall-card`}>
        <OnCallCard />
      </Box>
    )
  ].filter(Boolean);

  return (
    <>
      <Box id={homeScreenId}>
        <CardGridWrapper>{cards}</CardGridWrapper>
      </Box>

      <Box id={onboardingCompleteId} sx={{ display: "none" }} />

      <Onboarding />
    </>
  );
};

export default HomeScreen;
