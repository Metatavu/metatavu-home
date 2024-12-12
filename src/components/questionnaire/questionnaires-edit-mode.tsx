import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Checkbox,
  FormControl,
  FormControlLabel,
  TextField,
  Typography
} from "@mui/material";
import {} from "@mui/material";
import { useState } from "react";
import type { Questionnaire, Question, AnswerOption } from "src/generated/homeLambdasClient";
import NewQuestionCard from "./new-question-card";
import { useNavigate } from "react-router";
import { useSetAtom } from "jotai";
import { errorAtom } from "src/atoms/error";
import { useLambdasApi } from "src/hooks/use-api";
import strings from "src/localization/strings";
import { Link } from "react-router-dom";
import { CheckBox, KeyboardReturn } from "@mui/icons-material";

// TODO: TSDocs, PopUp when saving updated questionnaire, Add checkbox that will empty passedUsers array in the questionnaire

interface Props {
  questionnaire: Questionnaire;
}

const QuestionnairesEditMode = ({ questionnaire }: Props) => {
  const navigate = useNavigate();
  const { questionnairesApi } = useLambdasApi();
  const [loading, setLoading] = useState(false);
  const setError = useSetAtom(errorAtom);
  const [editedQuestionnaire, setEditedQuestionnaire] = useState<Questionnaire>(questionnaire);
  const [clearPassedUsers, setClearPassedUsers] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedQuestionnaire((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuestionChange = (questionIndex: number, updatedFields: Partial<Question>) => {
    const updatedQuestions = editedQuestionnaire.questions.map((question, optionIndex) =>
      optionIndex === questionIndex ? { ...question, ...updatedFields } : question
    );
    setEditedQuestionnaire((prev) => ({ ...prev, questions: updatedQuestions }));
  };

  const handleAnswerOptionChange = (
    questionIndex: number,
    optionIndex: number,
    updatedFields: Partial<AnswerOption>
  ) => {
    const updatedOptions = editedQuestionnaire.questions[questionIndex].answerOptions.map(
      (option, i) => (i === optionIndex ? { ...option, ...updatedFields } : option)
    );

    handleQuestionChange(questionIndex, { answerOptions: updatedOptions });
  };

  /**
   * Functions to add new question to Questionnaire that is being built
   *
   * @param questionText string
   * @param list of QuestionOptions
   */
  const handleAddQuestion = ({
    questionText,
    answerOptions
  }: { questionText: string; answerOptions: AnswerOption[] }) => {
    setEditedQuestionnaire((prevQuestionnaire) => ({
      ...prevQuestionnaire,
      questions: [...prevQuestionnaire.questions, { questionText, answerOptions }]
    }));
  };

  const handleDeleteQuestion = (questionIndex: number) => {
    const updatedQuestions = editedQuestionnaire.questions.filter(
      (_, optionIndex) => optionIndex !== questionIndex
    );
    setEditedQuestionnaire((prev) => ({ ...prev, questions: updatedQuestions }));
  };

  /**
   * Function to count all correct answers in the questionnaire, used for passScore determination
   */
  const countEditedCorrectAnswers = () => {
    return editedQuestionnaire.questions.reduce((count, question) => {
      return count + (question.answerOptions?.filter((option) => option.isCorrect).length || 0);
    }, 0);
  };

  const maxCorrectAnswers = countEditedCorrectAnswers();

  const handlePassScoreChange = (value : number) => {
    const maxCorrectAnswers = countEditedCorrectAnswers();
    const passScore = Math.min(value, maxCorrectAnswers);
    setEditedQuestionnaire((prev) => ({ ...prev, passScore}));
  };

  const updateEditedQuestionnaire = async () => {
    setLoading(true);
    try {
      const updatedQuestionnaire = await questionnairesApi.updateQuestionnaires({
        id: editedQuestionnaire.id as string,
        questionnaire: {
          ...editedQuestionnaire,
          passedUsers: clearPassedUsers ? [] : editedQuestionnaire.passedUsers
        }
      });
      navigate(-1);
      return updatedQuestionnaire;
    } catch (error) {
      setError(`${strings.error.questionnaireSaveFailed}, ${error}`);
    }
    setLoading(false);
  };

  return (
    <>
      <Card>
        <CardContent>
          <Typography variant="h5">{strings.questionnaireEdit.title}</Typography>
          <TextField
            label={strings.questionnaireEdit.titleLabel}
            name="title"
            value={editedQuestionnaire.title || ""}
            onChange={handleChange}
            fullWidth
            sx={{ mt: 3, mb: 2 }}
          />
          <TextField
            label={strings.questionnaireEdit.descriptionLabel}
            name="description"
            value={editedQuestionnaire.description || ""}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 4 }}
          />

          {editedQuestionnaire.questions.map((question, questionIndex) => (
            <div key={questionIndex}>
              <TextField
                label={`${strings.questionnaireEdit.question} ${questionIndex + 1}`}
                value={question.questionText}
                onChange={(e) =>
                  handleQuestionChange(questionIndex, { ...question, questionText: e.target.value })
                }
                fullWidth
                margin="normal"
              />
              <Box sx={{}}>
                {question.answerOptions.map((option, optionIndex) => (
                  <Box key={optionIndex} sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Checkbox
                      sx={{ mr: 1 }}
                      color="success"
                      checked={option.isCorrect}
                      onChange={() =>
                        handleAnswerOptionChange(questionIndex, optionIndex, {
                          isCorrect: !option.isCorrect
                        })
                      }
                    />
                    <TextField
                      value={option.label}
                      onChange={(e) =>
                        handleAnswerOptionChange(questionIndex, optionIndex, {
                          label: e.target.value
                        })
                      }
                      fullWidth
                    />
                  </Box>
                ))}
              </Box>
              <Button
                sx={{ color: "red", float: "right", mb: 2 }}
                size="small"
                onClick={() => handleDeleteQuestion(questionIndex)}
              >
                {strings.questionnaireEdit.deleteQuestion}
              </Button>
            </div>
          ))}
          <NewQuestionCard handleAddQuestion={handleAddQuestion} />
          <CardActions
            sx={{
              display: "flex",
              width: "100%",
              mt: 4,
              justifyContent: "space-between",
              alignContent: "center"
            }}
          >
            <TextField
              label={strings.questionnaireEdit.passScoreLabel}
              type="number"
              value={Math.min(editedQuestionnaire.passScore || 0, maxCorrectAnswers)}
              onChange={(e) => {
                const value = Number.parseInt(e.target.value, 10) || 0;
                handlePassScoreChange(value > maxCorrectAnswers ? maxCorrectAnswers : value);
              }}
              InputProps={{
                inputProps: { 
                  min: 0, 
                  max: maxCorrectAnswers,
                  }
              }}
              onKeyDown={(e) => {
                if (["e", "E", "+", "-", ".", ","].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              helperText={`${strings.questionnaireEdit.passScoreMax} ${maxCorrectAnswers}`}
            />
            <FormControlLabel
            control={
              <Checkbox
                checked={clearPassedUsers}
                onChange={(e) => setClearPassedUsers(e.target.checked)}
                color="primary"
              />
            }
            label={strings.questionnaireEdit.clearPassedUsers}
            />
            <Button
              sx={{ alignItems: "center" }}
              onClick={updateEditedQuestionnaire}
              disabled={loading}
              variant="contained"
              size="large"
              color="success"
            >
              {strings.questionnaireEdit.update}
            </Button>
          </CardActions>
        </CardContent>
      </Card>
      <Card sx={{ mt: 2, width: "100%" }}>
        <Link to={"/admin/questionnaire"} style={{ textDecoration: "none" }}>
          <Button variant="contained" sx={{ p: 2, width: "100%" }}>
            <KeyboardReturn sx={{ marginRight: "10px" }} />
            <Typography>{strings.questionnaireScreen.back}</Typography>
          </Button>
        </Link>
      </Card>
    </>
  );
};
export default QuestionnairesEditMode;
