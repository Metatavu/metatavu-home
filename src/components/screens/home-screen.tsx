import { Box, Grid, Skeleton } from "@mui/material";
import { useAtomValue } from "jotai";
import type { ReactNode } from "react";
import { userProfileAtom } from "src/atoms/auth";
import { usersAtom } from "src/atoms/user";
import type { User } from "src/generated/homeLambdasClient";
import useUserRole from "src/hooks/use-user-role";
import strings from "src/localization/strings";
import { OnboardingScreen } from "src/types/index";
import BalanceCard from "../home/balance-card";
import CardGridWrapper from "../home/common/card-grid-wrapper";
import MemoCard from "../home/memo-card";
import OnCallCard from "../home/oncall-card";
import QuestionnaireCard from "../home/questionnaire-card";
import SoftwareRegistryCard from "../home/software-registry-card";
import SprintViewCard from "../home/sprint-view-card";
import TrelloCard from "../home/trello-card";
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

  const hasSeveraUserId = !!loggedInUser?.attributes?.severaUserId;

  const isPrivilegedUser = isDeveloper || isTester;

  /**
   * Renders a card with a skeleton loader
   *
   * @param title - Title of the card
   * @param content - Content to render inside the card
   * @returns ReactNode containing the card
   */
  const renderCardWithSkeleton = (title: string, content: ReactNode) => (
    <Box
      sx={{
        background: "#ffffff",
        borderRadius: 1,
        boxShadow: "0px 2px 8px rgba(0,0,0,0.05)",
        minHeight: title === strings.sprint.sprintview ? 270 : 120,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start"
      }}
    >
      <Grid sx={{ padding: 2 }}>
        <Box sx={{ fontWeight: "bold", fontSize: 22 }}>{title}</Box>
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

  const cards: ReactNode[] = [
    isPrivilegedUser && (
      <Box key="balance" id="balance-card">
        {!hasSeveraUserId ? (
          renderCardWithSkeleton(strings.balanceCard.balance, <></>)
        ) : (
          <BalanceCard />
        )}
      </Box>
    ),
    isPrivilegedUser && (
      <Box key="sprint" id="sprint-view-card" sx={{ minHeight: 270 }}>
        {!hasSeveraUserId ? (
          renderCardWithSkeleton(strings.sprint.sprintview, <></>)
        ) : (
          <SprintViewCard />
        )}
      </Box>
    ),
    isPrivilegedUser && (
      <Box key="vacations" id="vacations-card">
        <VacationsCard />
      </Box>
    ),
    isPrivilegedUser && (
      <Box key="questionnaires" id="questionnaires-card">
        <QuestionnaireCard />
      </Box>
    ),
    isPrivilegedUser && (
      <Box key="software" id="software-registry-card">
        <SoftwareRegistryCard />
      </Box>
    ),
    isPrivilegedUser && (
      <Box key="wiki" id="wiki-documentation-card">
        <WikiDocumentationCard />
      </Box>
    ),
    isPrivilegedUser && (
      <Box key="oncall" id="oncall-card">
        <OnCallCard />
      </Box>
    ),
    isPrivilegedUser && (
      <Box key="memo" id="memo-card">
        <MemoCard />
      </Box>
    )
  ].filter(Boolean);

  return (
    <>
      <Box id="home-screen">
        <CardGridWrapper>{cards}</CardGridWrapper>
      </Box>

      <Box id="onboarding-complete" sx={{ display: "none" }} />

      <Onboarding screen={OnboardingScreen.Home} />
    </>
  );
};

export default HomeScreen;
