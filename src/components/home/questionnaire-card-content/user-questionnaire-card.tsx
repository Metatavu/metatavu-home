import { CardContent, Grid, Skeleton, Typography } from "@mui/material";
import { useSetAtom, useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { userProfileAtom } from "src/atoms/auth";
import { errorAtom } from "src/atoms/error";
import { usersAtom } from "src/atoms/user";
import type { Questionnaire, User } from "src/generated/homeLambdasClient";
import { useLambdasApi } from "src/hooks/use-api";
import strings from "src/localization/strings";

const UserQuestionnaireCard = () => {
  const [loading, setLoading] = useState(false);
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const { questionnairesApi } = useLambdasApi();
  const setError = useSetAtom(errorAtom);
  const users = useAtomValue(usersAtom);
  const userProfile = useAtomValue(userProfileAtom);
  const loggedInUser = users.find((user: User) => user.id === userProfile?.id);

  useEffect(() => {
    const fetchQuestionnaires = async () => {
      setLoading(true);
      try {
        const questionnaires = await questionnairesApi.listQuestionnaires();
        setQuestionnaires(questionnaires);
      } catch (error) {
        setError(`${strings.error.questionnaireLoadFailed}, ${error}`);
      }
      setLoading(false);
    };
    fetchQuestionnaires();
  }, []);

  /**
   * Count passed questionnaires by Logged in user
   * @returns number of passed questionnaires
   */

  const getPassedQuestionnaires = () => {
    if (!loggedInUser) return 0;
    return questionnaires.reduce((count, questionnaire) => {
      if (questionnaire.passedUsers?.includes(loggedInUser.id)) {
        return count + 1;
      }
      return count;
    }, 0);
  };

  /**
   * Render user progress
   */
  const renderUserProgress = () => (
    <>
      <CardContent>
        <Typography variant="h6" fontWeight={"bold"}>
          {strings.questionnaireCard.questionnaires}
        </Typography>
        <Typography>
          {strings.formatString(
            strings.questionnaireCard.passedQuestionnaires,
            getPassedQuestionnaires(),
            questionnaires.length
          )}
        </Typography>
      </CardContent>
    </>
  );

  return <>{loading ? <Skeleton /> : renderUserProgress()}</>;
};

export default UserQuestionnaireCard;
