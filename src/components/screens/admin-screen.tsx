import useUserRole from "src/hooks/use-user-role";
import CardGridWrapper from "../home/common/card-grid-wrapper";
import WikiDocumentationCard from "../home/wiki-documentation-card";

// Commented out imports for admin cards that are currently disabled in production.
/* 
import { Box } from "@mui/material";
import BalanceCard from "../home/balance-card";
import OnCallCard from "../home/oncall-card";
import QuestionnaireCard from "../home/questionnaire-card";
import SoftwareRegistryCard from "../home/software-registry-card";
import SprintViewCard from "../home/sprint-view-card";
import VacationManagementCard from "../home/vacation-management-card";
import VacationsCard from "../home/vacations-card";
*/

/**
 * Admin screen component
 */
const AdminScreen = () => {
  const { isTester } = useUserRole();
  //const { isDeveloper, isTester } = useUserRole();
  // const isPrivilegedUser = isDeveloper || isTester;

  /**
   * Сard collection, new component cards should be added here
   */
  const cards = [
    // Wiki is enabled in production for testers only.
    isTester && <WikiDocumentationCard key="wiki" />

    // The following admin cards are disabled for production (commented out).
    // They remain in the codebase for easy re-enabling in non-production builds.
    // isPrivilegedUser && <BalanceCard key="balance" />,
    // isPrivilegedUser && (
    //   <Box key="sprint" sx={{ minHeight: 260 }}>
    //     <SprintViewCard />
    //   </Box>
    // ),
    // isPrivilegedUser && <VacationsCard key="vacations" />,
    // isPrivilegedUser && <QuestionnaireCard key="questionnaire" />,
    // isPrivilegedUser && <SoftwareRegistryCard key="software" />,
    // isPrivilegedUser && (
    //   <Box key="vacationManagement" sx={{ maxHeight: 420 }}>
    //     <VacationManagementCard />
    //   </Box>
    // ),
    // isPrivilegedUser && <OnCallCard key="oncall" />
  ].filter(Boolean);

  return <CardGridWrapper>{cards}</CardGridWrapper>;
};

export default AdminScreen;
