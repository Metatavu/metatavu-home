import { Box, Typography, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { useLambdasApi } from "src/hooks/use-api";
import { useAtomValue } from "jotai";
import { userProfileAtom } from "src/atoms/auth";
import { usersAtom } from "src/atoms/user";
import type { Questionnaire, User } from "src/generated/homeLambdasClient";
import strings from "src/localization/strings";

/**
 * Component to display user's questionnaire progress on home screen
 * Located in home folder as it's specific to the dashboard
 */
const QuestionnaireProgress = () => {
  const { questionnairesApi } = useLambdasApi();
  const userProfile = useAtomValue(userProfileAtom);
  const users = useAtomValue(usersAtom);
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [loading, setLoading] = useState(true);
  
  const loggedInUser = users.find((user: User) => user.id === userProfile?.id);

  useEffect(() => {
    const fetchQuestionnaires = async () => {
      setLoading(true);
      try {
        const response = await questionnairesApi.listQuestionnaires();
        setQuestionnaires(response);
      } catch (error) {
        console.error("Failed to fetch questionnaires:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuestionnaires();
  }, [questionnairesApi]);

  // Calculate passed questionnaires
  const passedCount = questionnaires.filter(
    q => q.passedUsers?.includes(loggedInUser?.id || "")
  ).length;
  
  const totalCount = questionnaires.length;

  if (loading) {
    return (
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress size={30} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', fontSize: 22 }}>
        {strings.questionnaireProgress?.title || "Questionnaires"}
      </Typography>
      
      <Typography variant="body1" color="text.secondary">
        {strings.formatString(
          strings.questionnaireProgress?.progressText || "You have passed {0} out of {1} questionnaires",
          passedCount,
          totalCount
        )}
      </Typography>
    </Box>
  );
};

export default QuestionnaireProgress;