import { Box, CardContent } from "@mui/material";
import useUserRole from "src/hooks/use-user-role";
import strings from "src/localization/strings";
import HomepageCard, { type CardProps } from "../generics/homepageCard";
import QuestionnaireProgress from "./questionnaire-progress";

/**
 * Component for displaying questionnaire card
 */
const QuestionnaireCard = ({ hidden, onToggleHidden, editmode }: CardProps) => {
  const { adminMode } = useUserRole();
  const linkTarget = adminMode ? "/admin/questionnaire" : "/questionnaire";

  return (
    <HomepageCard
      title={
        adminMode
          ? strings.questionnaireCard.questionnairesBuilder
          : strings.questionnaireProgress.title
      }
      content={<QuestionnaireProgress />}
      path={linkTarget}
      hidden={hidden}
      onToggleHidden={onToggleHidden}
      editmode={editmode}
    />
  );
};

export default QuestionnaireCard;
