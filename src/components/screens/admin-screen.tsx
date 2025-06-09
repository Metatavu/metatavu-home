import CardGridWrapper from "../home/common/card-grid-wrapper";
import BalanceCard from "../home/balance-card";
import VacationsCard from "../home/vacations-card";
import SprintViewCard from "../home/sprint-view-card";
import UserRoleUtils from "src/utils/user-role-utils";
import QuestionnaireCard from "../home/questionnaire-card";
import { Box } from "@mui/material";

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
    isPrivilegedUser && <BalanceCard/>,
    isPrivilegedUser && <Box sx={{minHeight:260}}><SprintViewCard/></Box>,
    isPrivilegedUser && <VacationsCard/>,
    isPrivilegedUser && <QuestionnaireCard/>
  ].filter(Boolean);

  return (
    <CardGridWrapper>
      {cards}
    </CardGridWrapper>
  );
};

export default AdminScreen;