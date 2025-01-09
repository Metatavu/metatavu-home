import { CardContent, Skeleton, Typography } from "@mui/material";
import { useAtomValue } from "jotai";
import { userProfileAtom } from "src/atoms/auth";
import { usersAtom } from "src/atoms/user";
import type { User } from "src/generated/homeLambdasClient";
import strings from "src/localization/strings";
import useFetchQuestionnaires from "src/hooks/fetch-questionnaires";

/**
 * User Questionnaire Card Component
 */
const UserQuestionnaireCard = () => {
  const { loading, questionnaires } = useFetchQuestionnaires();
  const users = useAtomValue(usersAtom);
  const userProfile = useAtomValue(userProfileAtom);
  const loggedInUser = users.find((user: User) => user.id === userProfile?.id);

  /**
   * Count passed questionnaires by Logged in user
   *
   * @returns number of passed questionnaires
   */
  const getPassedQuestionnaires = () => {
    return loggedInUser
      ? questionnaires.filter((questionnaire) =>
          questionnaire.passedUsers?.includes(loggedInUser.id)
        ).length
      : 0;
  };

  /**
   * Render user progress
   */
  const renderUserProgress = () => (
    <>
      <CardContent>
        <Typography variant="body1">
          {strings.formatString(
            strings.questionnaireCard.passedQuestionnaires, 
            { passedCount: getPassedQuestionnaires(), totalCount: questionnaires.length }
          )}
        </Typography>
      </CardContent>
    </>
  );

  return <>{loading ? <Skeleton /> : renderUserProgress()}</>;
};

export default UserQuestionnaireCard;
