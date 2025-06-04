import CardGridWrapper from "../home/common/card-grid-wrapper";
import BalanceCard from "../home/balance-card";
import VacationsCard from "../home/vacations-card";
import SprintViewCard from "../home/sprint-view-card";
import UserRoleUtils from "src/utils/user-role-utils";
import QuestionnaireCard from "../home/questionnaire-card";

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
    isPrivilegedUser && <SprintViewCard key="sprint" />,
    isPrivilegedUser && <VacationsCard key="vacations" />,
    isPrivilegedUser && <QuestionnaireCard key="questionnaire" />
  ].filter(Boolean);

  return (
    <CardGridWrapper>
      {cards}
    </CardGridWrapper>
  );
};

export default AdminScreen;