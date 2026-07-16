import useUserRole from "src/hooks/use-user-role";
import strings from "src/localization/strings";
import HomepageCard, { type CardProps } from "../generics/homepageCard";
import QuestionnaireProgress from "./questionnaire-progress";

/**
 * Questionnaire card component
 *
 * @param props.hidden - Boolean defining if the card is visible
 * @param props.onToggleHidden - Functionality to change card's visibility
 * @param props.editmode - Boolean defining if editmode is on
 *
 * @returns Card component showing user their questionnair progress.
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
      content={<QuestionnaireProgress hidden={hidden} />}
      path={linkTarget}
      hidden={hidden}
      onToggleHidden={onToggleHidden}
      editmode={editmode}
    />
  );
};

export default QuestionnaireCard;
