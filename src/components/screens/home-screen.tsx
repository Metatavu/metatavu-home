import { Box } from "@mui/material";
import type { ReactNode } from "react";
import useUserRole from "src/hooks/use-user-role";
import { OnboardingScreen } from "src/types/index";
import CardGridWrapper from "../home/common/card-grid-wrapper";
import WikiDocumentationCard from "../home/wiki-documentation-card";
import Onboarding from "../onboarding/Onboarding";

/*
 * Production (wiki-only): the following imports are disabled.
 * Re-enable together with their corresponding cards/routes when needed.
 *
 * import { Grid, Skeleton, useTheme } from "@mui/material";
 * import { useAtomValue } from "jotai";
 * import { userProfileAtom } from "src/atoms/auth";
 * import { usersAtom } from "src/atoms/user";
 * import type { User } from "src/generated/homeLambdasClient";
 * import strings from "src/localization/strings";
 * import BalanceCard from "../home/balance-card";
 * import OnCallCard from "../home/oncall-card";
 * import QuestionnaireCard from "../home/questionnaire-card";
 * import SoftwareRegistryCard from "../home/software-registry-card";
 * import SprintViewCard from "../home/sprint-view-card";
 * import VacationsCard from "../home/vacations-card";
 */

/**
 * Home screen component
 */
const HomeScreen = () => {
  // Production (wiki-only): theme, role checks and Severa-related vars commented out.
  const { isTester } = useUserRole();

  /*
   * Production (wiki-only): the following variables and function are disabled.
   * Re-enable together with the cards that depend on them.
   *
   * const theme = useTheme();
   * const { isDeveloper, isTester } = useUserRole();
   * const users = useAtomValue(usersAtom);
   * const userProfile = useAtomValue(userProfileAtom);
   * const loggedInUser = users.find((user: User) => user.id === userProfile?.id);
   * const hasSeveraUserId = !!loggedInUser?.attributes?.severaUserId;
   * const isPrivilegedUser = isDeveloper || isTester;
   *
   * const renderCardWithSkeleton = (title: string, content: ReactNode) => (
   *   <Box sx={{ background: theme.palette.background.paper, borderRadius: 1, ... }}>
   *     ...
   *   </Box>
   * );
   */

  const cards: ReactNode[] = [
    // Wiki is enabled in production for testers only.
    isTester && (
      <Box key="wiki" id="wiki-documentation-card">
        <WikiDocumentationCard />
      </Box>
    )

    // The following home cards are disabled for production (commented out).
    // They remain here for reference and easy re-enabling in non-production builds.
    // isPrivilegedUser && (
    //   <Box key="balance" id="balance-card">
    //     {!hasSeveraUserId ? (
    //       renderCardWithSkeleton(strings.balanceCard.balance, <></>)
    //     ) : (
    //       <BalanceCard />
    //     )}
    //   </Box>
    // ),
    // isPrivilegedUser && (
    //   <Box key="sprint" id="sprint-view-card" sx={{ minHeight: 270 }}>
    //     {!hasSeveraUserId ? (
    //       renderCardWithSkeleton(strings.sprint.sprintview, <></>)
    //     ) : (
    //       <SprintViewCard />
    //     )}
    //   </Box>
    // ),
    // isPrivilegedUser && (
    //   <Box key="vacations" id="vacations-card">
    //     <VacationsCard />
    //   </Box>
    // ),
    // isPrivilegedUser && (
    //   <Box key="questionnaires" id="questionnaires-card">
    //     <QuestionnaireCard />
    //   </Box>
    // ),
    // isPrivilegedUser && (
    //   <Box key="software" id="software-registry-card">
    //     <SoftwareRegistryCard />
    //   </Box>
    // ),
    // isPrivilegedUser && (
    //   <Box key="oncall" id="oncall-card">
    //     <OnCallCard />
    //   </Box>
    // )
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
