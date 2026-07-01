import { DoneOutlineRounded, PriorityHighRounded } from "@mui/icons-material";
import { Box, CircularProgress, Typography, useTheme } from "@mui/material";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { userProfileAtom } from "src/atoms/auth";
import { errorAtom } from "src/atoms/error";
import { usersAtom } from "src/atoms/user";
import type { Questionnaire, User } from "src/generated/homeLambdasClient";
import { useLambdasApi } from "src/hooks/use-api";
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
  const [loading, setLoading] = useState(false);
  const [before, after] = strings.questionnaireProgress.progressText.split("{0}");
  const theme = useTheme();

  const loggedInUser = users.find((user: User) => user.id === userProfile?.id);
  const setError = useSetAtom(errorAtom);
  useEffect(() => {
    const fetchQuestionnaires = async () => {
      try {
        const response = await questionnairesApi.listQuestionnaires();
        setQuestionnaires(response);
      } catch (error: any) {
        const errorMessage = await error.response.json();
        setError(`${strings.error.fetchFailedQuestionnaires}: ${errorMessage.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionnaires();
  }, [questionnairesApi]);

  // Calculate passed questionnaires
  const passedCount = questionnaires.filter((q) =>
    q.passedUsers?.includes(loggedInUser?.id || "")
  ).length;

  const remaining = Math.max(questionnaires.length - passedCount, 0);

  if (loading) {
    return (
      <Box sx={{ width: "100%", display: "flex", justifyContent: "center", p: 2 }}>
        <CircularProgress size={30} />
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="row" marginTop={theme.spaces.m}>
      {" "}
      {remaining > 0 ? (
        <PriorityHighRounded
          sx={{
            color: theme.palette.foreground.negative,
            height: 24,
            width: 24,
            mr: theme.spaces.s
          }}
        />
      ) : (
        <DoneOutlineRounded
          sx={{
            color: theme.palette.foreground.positive,
            height: 24,
            width: 24,
            mr: theme.spaces.s
          }}
        />
      )}{" "}
      <Typography fontStyle="body">
        {" "}
        {before} <span style={{ fontWeight: 700 }}>{remaining}</span> {after}{" "}
      </Typography>{" "}
    </Box>
  );
};

export default QuestionnaireProgress;
