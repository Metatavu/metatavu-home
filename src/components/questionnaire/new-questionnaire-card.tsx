import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  Checkbox,
  TextField,
  Typography
} from "@mui/material";
import type React from "react";
import { useState } from "react";
import type { AnswerOption } from "src/generated/homeLambdasClient";
import strings from "src/localization/strings";

/**
 * Interface for the NewQuestionnaireCard component
 */
interface Props {
  handleAddQuestion: ({
    questionText,
    answerOptions
  }: { questionText: string; answerOptions: AnswerOption[] }) => void;
}

/**
 * New Questionnaire Card Component
 *
 * @params handleAddQuestion
 */
const NewQuestionnaireCard = ({ handleAddQuestion }: Props) => {
  const [questionText, setQuestionText] = useState("");
  const [answerOptions, setAnswerOptions] = useState([{ label: "", isCorrect: false }]);

  /**
   * Handle answerOptions label (answer option) change
   *
   * @param index
   */
  const handleAnswerLabelChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const updatedAnswerOptions = [...answerOptions];
    updatedAnswerOptions[index].label = event.target.value;
    setAnswerOptions(updatedAnswerOptions);
  };

  /**
   * Handle answerOptions value change (checkbox)
   *
   * @param index
   */
  const handleCheckboxChange = (index: number) => {
    const updatedAnswerOptions = [...answerOptions];
    updatedAnswerOptions[index].isCorrect = !updatedAnswerOptions[index].isCorrect;
    setAnswerOptions(updatedAnswerOptions);
  };

  /**
   * Handle adding a new option (adds an empty option to the list)
   */
  const handleAddNewOption = () => {
    setAnswerOptions([...answerOptions, { label: "", isCorrect: false }]);
  };

  /**
   * Handle adding new question (submitting the question and answerOptions + resetting the form)
   */
  const handleAddNewQuestion = () => {
    handleAddQuestion({ questionText, answerOptions });
    setQuestionText("");
    setAnswerOptions([{ label: "", isCorrect: false }]);
  };

  return (
    <>
      <Card
        className="new-question"
        sx={{
          p: 2,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          height: "100%"
        }}
      >
        <CardContent sx={{ width: "100%", p: 2 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {strings.newQuestionnaireCard.newQuestion}
          </Typography>
          <TextField
            id="textfield-question-body"
            label={strings.newQuestionnaireCard.questionLabel}
            multiline
            rows={6}
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            fullWidth
          />
          <Typography variant="body1" sx={{ mt: 2 }}>
            {strings.newQuestionnaireCard.correctAnswer}
          </Typography>
          {answerOptions.map((option, index) => (
            <Box
              key={index}
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: "center"
              }}
            >
              <Box sx={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
                <Checkbox
                  checked={option.isCorrect}
                  onChange={() => handleCheckboxChange(index)}
                  name={`option-${index + 1}`}
                  color="success"
                  sx={{ width: "auto", mt: 2 }}
                />
              </Box>
              <Box
                sx={{
                  width: "100%",
                  ml: 2,
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <TextField
                  id="textfield-answer-option"
                  variant="outlined"
                  label={strings.newQuestionnaireCard.answerLabel}
                  placeholder={strings.newQuestionnaireCard.insertAnswerLabel}
                  value={option.label}
                  onChange={(e) => handleAnswerLabelChange(index, e)}
                  fullWidth
                  sx={{ mt: 2 }}
                />
              </Box>
            </Box>
          ))}
          <CardActions
            sx={{
              display: "flex",
              width: "100%",
              mt: 4,
              justifyContent: "space-between"
            }}
          >
            <Button
              sx={{ alignItems: "center" }}
              size="large"
              variant="text"
              onClick={handleAddNewOption}
            >
              <Typography sx={{ fontWeight: "bold" }}>
                {strings.newQuestionnaireCard.addAnswer}
              </Typography>
            </Button>
            <Button
              sx={{ alignItems: "center" }}
              size="large"
              variant="contained"
              onClick={handleAddNewQuestion}
            >
              {strings.newQuestionnaireCard.saveAnswer}
            </Button>
          </CardActions>
        </CardContent>
      </Card>
    </>
  );
};

export default NewQuestionnaireCard;
