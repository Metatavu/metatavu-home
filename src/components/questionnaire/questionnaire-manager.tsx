import { KeyboardReturn } from "@mui/icons-material";
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogTitle } from "@mui/material";
import { useEffect, useState } from "react";
import type { Questionnaire } from "src/generated/homeLambdasClient";
import strings from "src/localization/strings";
import type { QuestionnairePreviewMode } from "src/types";
import QuestionnaireFillMode from "./questionnaires-fill-mode";
import { useAtomValue, useSetAtom } from "jotai";
import { useParams } from "react-router";
import { errorAtom } from "src/atoms/error";
import { useLambdasApi } from "src/hooks/use-api";
import { useNavigate } from "react-router-dom";
import { usersAtom } from "src/atoms/user";
import { userProfileAtom } from "src/atoms/auth";
import type { User } from "src/generated/homeLambdasClient";

/**
 * Component properties
 */
interface Props {
  mode: QuestionnairePreviewMode;
}

/**
 * Interface for the user responses
 */
interface UserResponses {
  [questionText: string]: string[];
}

/**
 *  Manager page for user to interact with the questionnaire; fill and edit
 *
 * @param props component properties
 */
const QuestionnaireManager = ({ mode }: Props) => {
  const { id } = useParams();
  const { questionnairesApi } = useLambdasApi();
  const setError = useSetAtom(errorAtom);
  const [questionnaire, setQuestionnaire] = useState<Questionnaire>({
    id: "",
    title: "",
    description: "",
    questions: [],
    passScore: 0
  });
  const [loading, setLoading] = useState(false);
  const [userResponses, setUserResponses] = useState<UserResponses>({});
  const [questionnaireFeedbackMessage, setQuestionnaireFeedbackMessage] = useState<string | null>(null);
  const [questionnaireFeedbackDialogOpen, setQuestionnaireFeedbackDialogOpen] = useState(false);
  const users = useAtomValue(usersAtom);
  const userProfile = useAtomValue(userProfileAtom);
  const navigate = useNavigate();

  const loggedInUser = users.find((user: User) => user.id === userProfile?.id);

  useEffect(() => {
    const fetchQuestionnaire = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const fetchedQuestionnaire = await questionnairesApi.getQuestionnairesById({ id });
        setQuestionnaire(fetchedQuestionnaire);
      } catch (error) {
        setError(`${strings.error.questionnaireLoadFailed}, ${error}`);
      }
      setLoading(false);
    };
    fetchQuestionnaire();
  }, [id, questionnairesApi, setError]);

  if (loading) {
    return (
      <CircularProgress
        size={50}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)"
        }}
      />
    );
  }

  /**
   * Function to handle the change of the answer option checkboxes
   *
   * @param questionText string
   * @param answerLabel string
   * @param isSelected boolean
   */
  const handleCheckboxChange = (questionText: string, answerLabel: string, isSelected: boolean) => {
    setUserResponses((prevResponses) => {
      const selectedAnswerLabels = prevResponses[questionText] || [];
      return {
        ...prevResponses,
        [questionText]: isSelected
          ? [...selectedAnswerLabels, answerLabel]
          : selectedAnswerLabels.filter((label) => label !== answerLabel)
      };
    });
  };

  /**
   * Function to handle the change of the answer option radio buttons
   *
   * @param questionText string
   * @param answerLabel string
   */
  const handleRadioChange = (questionText: string, answerLabel: string) => {
    setUserResponses((prevResponses) => ({
      ...prevResponses,
      [questionText]: [answerLabel]
    }));
  };

  /**
   * Function to count all correct answers in the filled up questionnaire
   */
  const countCorrectAnswers = () => {
    let answersCount = 0;

    questionnaire.questions?.forEach((question) => {
      const userAnswers = userResponses[question.questionText] || [];

      question.answerOptions.forEach((option) => {
        if (option.isCorrect && userAnswers.includes(option.label)) {
          answersCount++;
        }
      });
    });
    return answersCount;
  };

  /**
   * Function to handle the submission of the questionnaire
   * Save users Id to the passedUsers array in the questionnaire
   * Determine message based on the result
   */
  const handleSubmit = async () => {
    const correctAnswersCount = countCorrectAnswers();
    const passed = correctAnswersCount >= questionnaire.passScore;

    if (passed) {
      try {
        const passedQuestionnaire = await questionnairesApi.updateQuestionnaires({
          id: questionnaire.id as string,
          questionnaire: {
            ...questionnaire,
            passedUsers: [...(questionnaire.passedUsers || []), loggedInUser?.id as string]
          }
        });
        setQuestionnaireFeedbackMessage(
          `${strings.formatString(
            strings.questionnaireManager.passed,
            correctAnswersCount,
            questionnaire.passScore
          )}`
        );
        setQuestionnaireFeedbackDialogOpen(true);
        return passedQuestionnaire;
      } catch (error) {
        setError(`${strings.error.questionnaireSaveFailed}, ${error}`);
      }
    } else {
      setQuestionnaireFeedbackMessage(
        `${strings.formatString(
          strings.questionnaireManager.failed,
          correctAnswersCount,
          questionnaire.passScore
        )}`
      );
      setQuestionnaireFeedbackDialogOpen(true);
    }
  };

  /**
   * Function to close the dialog
   */
  const closeQuestionnaireFeedbackDialog = () => {
    setQuestionnaireFeedbackDialogOpen(false);
    setQuestionnaireFeedbackMessage(null);
    navigate(-1);
  };

  /**
   * Function to render the content of the card according to the mode
   */
  const renderCardContent = () => {
    switch (mode) {
      case "FILL":
        return (
          <QuestionnaireFillMode
            questionnaire={questionnaire}
            userResponses={userResponses}
            handleCheckboxChange={handleCheckboxChange}
            handleRadioChange={handleRadioChange}
          />
        );
      default:
        return null;
    }
  };

  /**
   * Render the buttons based on the mode
   */
  const renderButtons = () => {
    switch (mode) {
      case "FILL":
        return (
          <Box
            sx={{
              display: "flex",
              width: "100%",
              p: 3,
              justifyContent: "space-between"
            }}
          >
            <Button
              sx={{ alignItems: "center" }}
              size="large"
              onClick={() => navigate(-1)}
              startIcon={<KeyboardReturn />}
            >
              {strings.questionnaireManager.goBack}
            </Button>
            <Button
              sx={{ alignItems: "center" }}
              size="large"
              variant="contained"
              color="success"
              onClick={handleSubmit}
            >
              {strings.questionnaireManager.submit}
            </Button>
          </Box>
        );
      default:
        return null;
    }
  };

  /**
   * Render the dialog based on the mode
   */
  const renderDialog = () => {
    switch (mode) {
      case "FILL":
        return (
          <Dialog open={questionnaireFeedbackDialogOpen} onClose={closeQuestionnaireFeedbackDialog}>
            <DialogTitle>{questionnaireFeedbackMessage}</DialogTitle>
            <DialogActions>
              <Button onClick={closeQuestionnaireFeedbackDialog} color="primary">
                {strings.questionnaireManager.goBack}
              </Button>
            </DialogActions>
          </Dialog>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {renderCardContent()}
      {renderButtons()}
      {renderDialog()}
    </>
  );
};

export default QuestionnaireManager;
