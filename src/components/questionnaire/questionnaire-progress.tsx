import { Box, LinearProgress, Typography, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { useLambdasApi } from "src/hooks/use-api";
import { useAtomValue } from "jotai";
import { userProfileAtom } from "src/atoms/auth";
import { usersAtom } from "src/atoms/user";
import type { Questionnaire, User } from "src/generated/homeLambdasClient";
import strings from "src/localization/strings";

/**
 * Component to display user's questionnaire progress
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
  const progressPercentage = totalCount > 0 ? (passedCount / totalCount) * 100 : 0;

  if (loading) {
    return (
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress size={30} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h6" gutterBottom>
        {strings.questionnaireProgress?.title || "Questionnaires"}
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {strings.formatString(
          strings.questionnaireProgress?.progressText || "You have passed {0} out of {1} questionnaires",
          passedCount,
          totalCount
        )}
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ width: '100%', mr: 1 }}>
          <LinearProgress 
            variant="determinate" 
            value={progressPercentage} 
            sx={{ 
              height: 10, 
              borderRadius: 5,
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 5,
                backgroundColor: progressPercentage === 100 ? '#4caf50' : '#1976d2'
              }
            }}
          />
        </Box>
        <Box sx={{ minWidth: 35 }}>
          <Typography variant="body2" color="text.secondary">
            {`${Math.round(progressPercentage)}%`}
          </Typography>
        </Box>
      </Box>
      
      {progressPercentage === 100 && (
        <Typography 
          variant="body2" 
          sx={{ 
            mt: 1, 
            color: '#4caf50',
            fontWeight: 'medium'
          }}
        >
          {strings.questionnaireProgress?.allCompleted || "🎉 Congratulations! You've completed all questionnaires!"}
        </Typography>
      )}
    </Box>
  );
};

export default QuestionnaireProgress;