import { Box } from "@mui/material";
import { useAtomValue } from "jotai";
import { userProfileAtom } from "src/atoms/auth";
import { usersAtom } from "src/atoms/user";
import type { User } from "src/generated/homeLambdasClient";
import useUserRole from "src/hooks/use-user-role";
import strings from "src/localization/strings";
import renderCardWithSkeleton from "src/utils/home-admin-utils";
import BalanceCard from "../home/balance-card";
import CardGridWrapper from "../home/common/card-grid-wrapper";
import OnCallCard from "../home/oncall-card";
import QuestionnaireCard from "../home/questionnaire-card";
import SoftwareRegistryCard from "../home/software-registry-card";
import SprintViewCard from "../home/sprint-view-card";
import VacationManagementCard from "../home/vacation-management-card";
import VacationsCard from "../home/vacations-card";
import WikiDocumentationCard from "../home/wiki-documentation-card";

/**
 * Admin screen component
 */
const AdminScreen = () => {
  const { isDeveloper, isTester } = useUserRole();
  const users = useAtomValue(usersAtom);
  const userProfile = useAtomValue(userProfileAtom);
  const loggedInUser = users.find((user: User) => user.id === userProfile?.id);
  const hasSeveraUserId = !!loggedInUser?.attributes?.severaUserId;

  const isPrivilegedUser = isDeveloper || isTester;

  /**
   * Сard collection, new component cards should be added here
   */
  const cards = [
    isPrivilegedUser && (
      <Box key="balance">
        {hasSeveraUserId && <BalanceCard />}
        {!hasSeveraUserId && renderCardWithSkeleton(strings.balanceCard.balance)}
      </Box>
    ),
    isPrivilegedUser && (
      <Box key="sprint">
        {hasSeveraUserId && <SprintViewCard />}
        {!hasSeveraUserId && renderCardWithSkeleton(strings.sprint.sprintview)}
      </Box>
    ),
    isPrivilegedUser && <VacationsCard key="vacations" />,
    isPrivilegedUser && <QuestionnaireCard key="questionnaire" />,
    isPrivilegedUser && <SoftwareRegistryCard key="software" />,
    isPrivilegedUser && (
      <Box key="vacationManagement" sx={{ maxHeight: 420 }}>
        <VacationManagementCard />
      </Box>
    ),
    isPrivilegedUser && <WikiDocumentationCard key="wiki" />,
    isPrivilegedUser && <OnCallCard key="oncall" />
  ].filter(Boolean);

  return <CardGridWrapper>{cards}</CardGridWrapper>;
};

export default AdminScreen;
