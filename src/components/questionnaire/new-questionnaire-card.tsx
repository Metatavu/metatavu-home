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
import strings from "src/localization/strings";

/**
 * Interface for the NewQuestionnaireCard component
 */
interface Props {
  handleAddQuestion: (question: string, options: { label: string; value: boolean }[]) => void;
}

/**
 * New Questionnaire Card Component
 * 
 * @params handleAddQuestion
 */
const NewQuestionnaireCard = ({ handleAddQuestion }: Props) => {
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState([{ label: "", value: false }]);

  /**
   * Handle options label (answer option) change
   * 
   * @param index
   */
  const handleAnswerLabelChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const updatedOptions = [...options];
    updatedOptions[index].label = event.target.value;
    setOptions(updatedOptions);
  };

  /**
   * Handle options value change (checkbox)
   * 
   * @param index
   */
  const handleCheckboxChange = (index: number) => {
    const updatedOptions = [...options];
    updatedOptions[index].value = !updatedOptions[index].value;
    setOptions(updatedOptions);
  };

  /**
   * Handle adding a new option (adds an empty option to the list)
   */
  const handleAddNewOption = () => {
    setOptions([...options, { label: "", value: false }]);
  };

  /**
   * Handle adding new question (submitting the question and options + resetting the form)
   */
  const handleAddNewQuestion = () => {
    handleAddQuestion(questionText, options);
    setQuestionText("");
    setOptions([{ label: "", value: false }]);
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
          {options.map((option, index) => (
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
                  checked={option.value}
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
                  value={option.label}
                  onChange={(e) => handleAnswerLabelChange(index, e)}
                  fullWidth
                  sx={{ mt: 2 }}
                />
              </Box>
            </Box>
          ))}
          <Button onClick={handleAddNewOption} sx={{ mt: 3 }}>
            <Typography sx={{ fontWeight: "bold", mb: 2 }}>
              {strings.newQuestionnaireCard.addAnswer}
            </Typography>
          </Button>
          <CardActionArea>
            <CardActions>
              <Button size="large" variant="contained" onClick={handleAddNewQuestion}>
                {strings.newQuestionnaireCard.saveAnswer}
              </Button>
            </CardActions>
          </CardActionArea>
        </CardContent>
      </Card>
    </>
  );
};

export default NewQuestionnaireCard;
