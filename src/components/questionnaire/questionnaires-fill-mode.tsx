import {
  Card,
  CardContent,
  Typography,
  Box,
  FormControlLabel,
  Checkbox,
  Divider,
  Radio
} from "@mui/material";
import type { AnswerOption, Question, Questionnaire } from "src/generated/homeLambdasClient";

/**
 * Component props
 */
interface Props {
  questionnaire: Questionnaire;
  userResponses: Record<string, string[]>;
  handleCheckboxChange: (questionText: string, answerLabel: string, isSelected: boolean) => void;
  handleRadioChange: (questionText: string, answerLabel: string) => void;
}

/**
 * Fill mode for the questionnaire
 *
 * @param props
 * @returns questionnaire fill mode component
 */
const QuestionnaireFillMode = ({
  questionnaire,
  userResponses,
  handleCheckboxChange,
  handleRadioChange
}: Props) => {
  /**
   * Function to count the correct answers in the question, so that we can determine how question is rendered
   *
   * @param question
   * @returns number of correct answers in the question
   */
  const getCorrectAnswerCount = (question: Question) => {
    return question.answerOptions.filter((option) => option.isCorrect).length;
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" align="left" sx={{ mt: 4, ml: 4 }}>
          {questionnaire.description}
        </Typography>
        <Box sx={{ marginTop: 4 }}>
          {questionnaire.questions.map((question: Question) => {
            const correctAnswerCount = getCorrectAnswerCount(question);
            const selectedOptions = userResponses[question.questionText] || [];
            const maxSelected = selectedOptions.length >= correctAnswerCount;

            return (
              <Box key={question.questionText} sx={{ mb: 4, ml: 4, mr: 4 }}>
                <Typography variant="h6">{question.questionText}</Typography>
                <Box>
                  {question.answerOptions.map((option: AnswerOption) => (
                    <FormControlLabel
                      key={option.label}
                      control={
                        correctAnswerCount === 1 ? (
                          <Radio
                            checked={selectedOptions.includes(option.label)}
                            onChange={() => handleRadioChange(question.questionText, option.label)}
                          />
                        ) : (
                          <Checkbox
                            checked={selectedOptions.includes(option.label)}
                            onChange={(e) =>
                              handleCheckboxChange(
                                question.questionText,
                                option.label,
                                e.target.checked
                              )
                            }
                            disabled={!selectedOptions.includes(option.label) && maxSelected}
                          />
                        )
                      }
                      label={option.label}
                      sx={{ display: "block", marginLeft: 2 }}
                    />
                  ))}
                </Box>
                <Divider sx={{ marginY: 2 }} />
              </Box>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
};

export default QuestionnaireFillMode;
