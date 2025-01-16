import type React from "react";
import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  FormControlLabel,
  Checkbox,
  Button,
  TextField
} from "@mui/material";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import type { Question } from "src/generated/homeLambdasClient";
import strings from "src/localization/strings";

/**
 * Component properties
 */
interface Props {
  questionnaire: {
    title: string;
    description: string;
    questions: Question[];
  };
  removeQuestionFromPreview: (index: number) => void;
  editQuestionInPreview: (index: number, question: Question) => void;
}

/**
 * Questionnaire Preview Component
 *
 * @param props component properties
 * @returns Questionnaire preview with ability to edit and remove questions
 */
const QuestionnairePreview = ({
  questionnaire,
  removeQuestionFromPreview,
  editQuestionInPreview
}: Props) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedQuestion, setEditedQuestion] = useState<Question | null>(null);

  /**
   * Fuction to handle the edit click, able to edit the question in preview
   *
   * @param index number
   */
  const handleEditClick = (index: number) => {
    setEditingIndex(index);
    setEditedQuestion(questionnaire.questions[index]);
  };

  /**
   * Function to handle the question text change in the preview edit
   *
   * @param event
   */
  const handleQuestionTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (editedQuestion) {
      setEditedQuestion({ ...editedQuestion, questionText: event.target.value });
    }
  };

  /**
   * Function to handle the answer option change in the preview edit
   *
   * @param index number
   * @param event
   */
  const handleAnswerOptionChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (editedQuestion) {
      const updatedOptions = editedQuestion.answerOptions.map((option, i) =>
        i === index ? { ...option, label: event.target.value } : option
      );
      setEditedQuestion({ ...editedQuestion, answerOptions: updatedOptions });
    }
  };

  /**
   * Function to handle the checkbox change in the preview edit
   *
   * @param index number
   */
  const handleCheckboxChange = (index: number) => {
    if (editedQuestion) {
      const updatedOptions = editedQuestion.answerOptions.map((option, i) =>
        i === index ? { ...option, isCorrect: !option.isCorrect } : option
      );
      setEditedQuestion({ ...editedQuestion, answerOptions: updatedOptions });
    }
  };

  /**
   * Function to validate the edited question
   */
  const validateEditedQuestion = () => {
    if (editedQuestion !== null && editingIndex !== null) {
      const allCheckboxesEmpty = editedQuestion.answerOptions.every((option) => !option.isCorrect);
      const isQuestionTextEmpty = !editedQuestion.questionText.trim();

      if (allCheckboxesEmpty || isQuestionTextEmpty) {
        alert(`${strings.questionnairePreview.saveAlert}`);
        return;
      }
      editQuestionInPreview(editingIndex, editedQuestion);
    }
  };

  /**
   * Function to handle saving changes in the preview edit
   */
  const handleSave = () => {
      validateEditedQuestion();
      setEditingIndex(null);
      setEditedQuestion(null);
  };

  return (
    <Card
      sx={{ p: 2, mt: 2, width: "100%", display: "flex", flexDirection: "column", height: "100" }}
    >
      <CardContent>
        <Typography variant="h4" gutterBottom>
          {questionnaire.title}
        </Typography>
        <Typography variant="h5" align="left" sx={{ mt: 2 }}>
          {questionnaire.description}
        </Typography>
        <Divider sx={{ marginY: 2 }} />

        <Box>
          {questionnaire.questions.map((question, index) => (
            <Box
              key={question.questionText}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                mb: 2
              }}
            >
              <Box>
                {editingIndex === index ? (
                  <>
                    <TextField
                      value={editedQuestion?.questionText || ""}
                      onChange={handleQuestionTextChange}
                      fullWidth
                      sx={{ mb: 2 }}
                    />
                    {editedQuestion?.answerOptions.map((option, i) => (
                      <Box key={i} sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                        <Checkbox
                          checked={option.isCorrect}
                          onChange={() => handleCheckboxChange(i)}
                        />
                        <TextField
                          value={option.label}
                          onChange={(event) => handleAnswerOptionChange(i, event)}
                          fullWidth
                        />
                      </Box>
                    ))}
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSave}
                      disabled={editedQuestion?.answerOptions === null}
                      sx={{ mt: 2 }}
                    >
                      {strings.questionnairePreview.save}
                    </Button>
                  </>
                ) : (
                  <>
                    <Typography>{question.questionText}</Typography>
                    <Box>
                      {question.answerOptions.map((option) => (
                        <FormControlLabel
                          key={option.label}
                          control={<Checkbox checked={option.isCorrect} />}
                          label={option.label}
                          sx={{ display: "block", ml: 2 }}
                        />
                      ))}
                    </Box>
                  </>
                )}
              </Box>
              <Box sx={{ display: "flex", flexDirection: "row", alignItems: "flex-end", mr: 2, gap: 2 }}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => removeQuestionFromPreview(index)}
                >
                  <DeleteForeverIcon sx={{ color: "red", mr: 2 }} />
                  {strings.questionnairePreview.remove}
                </Button>
                <Button variant="contained" color="primary" onClick={() => handleEditClick(index)}>
                  {strings.questionnairePreview.edit}
                </Button>
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default QuestionnairePreview;
