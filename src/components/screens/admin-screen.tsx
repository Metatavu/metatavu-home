import CardGridWrapper from "../home/common/card-grid-wrapper";
import BalanceCard from "../home/balance-card";
import VacationsCard from "../home/vacations-card";
import SprintViewCard from "../home/sprint-view-card";
import UserRoleUtils from "src/utils/user-role-utils";
import QuestionnaireCard from "../home/questionnaire-card";
import WikiDocumentationCard from "../home/wiki-documentation-card";
import VacationManagementCard from "../home/vacation-management-card";
import SoftwareRegistryCard from "../home/software-registry-card";
import { Box } from "@mui/material";
import OnCallCard from "../home/oncall-card";

/**
 * Admin screen component
 */
const AdminScreen = () => {
  const isDeveloperMode = UserRoleUtils.isDeveloper();
  const isTesterMode = UserRoleUtils.isTester();

  const isPrivilegedUser = isDeveloperMode || isTesterMode;

  /**
   * Сard collection, new component cards should be added here
   */
  const cards = [
    isPrivilegedUser && <BalanceCard key="balance" />,
    isPrivilegedUser && <Box key="sprint" sx={{minHeight:260}}><SprintViewCard /></Box>,
    isPrivilegedUser && <VacationsCard key="vacations" />,
    isPrivilegedUser && <QuestionnaireCard key="questionnaire" />,
    isPrivilegedUser && <SoftwareRegistryCard key="software" />,
    isPrivilegedUser && <Box key="vacationManagement" sx={{ maxHeight: 420 }}><VacationManagementCard /></Box>,
    isPrivilegedUser && <WikiDocumentationCard key="wiki" />,
    isPrivilegedUser && <OnCallCard key="oncall" />,
  ].filter(Boolean);

  return (
    <CardGridWrapper>
      {cards}
    </CardGridWrapper>
  );
};

export default AdminScreen;