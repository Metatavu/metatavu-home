import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
  useTheme
} from "@mui/material";
import { useAtomValue, useSetAtom } from "jotai";
import isEqual from "lodash/isEqual";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { errorAtom } from "src/atoms/error";
import { questionnaireTagsAtom } from "src/atoms/questionnaire";
import type { AnswerOption, Question, Questionnaire } from "src/generated/homeLambdasClient";
import { useLambdasApi } from "src/hooks/use-api";
import { useSnackbar } from "src/hooks/use-snackbar";
import strings from "src/localization/strings";
import { v4 as uuidv4 } from "uuid";
import BackButton from "../generics/back-button";
import TagsAutocomplete from "../generics/tags-autocomplete";
import NewQuestionCard from "./new-question-card";

/**
 * Component props
 */
interface Props {
  questionnaire: Questionnaire;
}

/**
 * Edit mode for the questionnaire
 *
 * @param props
 * @returns questionnaire edit mode component
 */
const QuestionnairesEditMode = ({ questionnaire }: Props) => {
  const navigate = useNavigate();
  const { questionnairesApi } = useLambdasApi();
  const [loading, setLoading] = useState(false);
  const setError = useSetAtom(errorAtom);
  const [editedQuestionnaire, setEditedQuestionnaire] = useState<Questionnaire>(questionnaire);
  const [clearPassedUsers, setClearPassedUsers] = useState(false);
  const [saveEnabled, setSaveEnabled] = useState(false);
  const showSnackbar = useSnackbar();
  const [tag, setTag] = useState("");
  const existingTags = useAtomValue(questionnaireTagsAtom);
  const theme = useTheme();

  useEffect(() => {
    if (!editedQuestionnaire.tags) {
      setEditedQuestionnaire((prev) => ({ ...prev, tags: [] }));
    }
    const hasChanges = !isEqual(editedQuestionnaire, questionnaire);
    const isValid = validateEditedQuestionnaire(editedQuestionnaire);
    setSaveEnabled(hasChanges && isValid);
    if (clearPassedUsers && isValid) {
      setSaveEnabled(true);
    }
  }, [editedQuestionnaire, questionnaire, clearPassedUsers]);

  /**
   * Function to validate edited questionnaire
   *
   * @param questionnaire
   * @returns boolean value
   */
  const validateEditedQuestionnaire = (questionnaire: Questionnaire): boolean => {
    const { title, description, questions } = questionnaire;
    if (!title || !description) return false;
    if (questions.length === 0) return false;
    if (!questionnaire.questions.every(isQuestionValid)) return false;

    return true;
  };

  /**
   * Validate a single question
   *
   * @param question - The question to validate
   * @returns boolean - True if the question is valid, false otherwise
   */
  const isQuestionValid = (question: Question): boolean => {
    if (!question.questionText || !question.questionText.trim()) {
      return false;
    }

    if (!question.answerOptions || question.answerOptions.length === 0) {
      return false;
    }

    const hasEmptyLabel = question.answerOptions.some((option) => !option.label?.trim());
    if (hasEmptyLabel) {
      return false;
    }

    const hasCorrectAnswer = question.answerOptions.some((option) => option.isCorrect);
    return hasCorrectAnswer;
  };

  /**
   * Handle change event for questionnaire title and description
   *
   * @param event - Change event
   */
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setEditedQuestionnaire((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Function to handle tag input change from Autocomplete
   *
   * @param _event - The event object
   * @param value - The new input value
   */
  const handleTagChange = (_event: React.SyntheticEvent<Element, Event>, value: string) => {
    setTag(value);
  };

  /**
   * Function to handle selected tags change from Autocomplete
   * @param _event - The event object
   * @param value - Array of selected tags
   */
  const handleSelectedTagChange = (
    _event: React.SyntheticEvent<Element, Event>,
    value: string[]
  ) => {
    setEditedQuestionnaire((prev) => ({
      ...prev,
      tags: value
    }));
  };

  /**
   * Function to handle Enter key press in tag input
   *
   * @param event - The keyboard event
   */
  const handleEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    if (tag && !editedQuestionnaire.tags?.includes(tag)) {
      setEditedQuestionnaire((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), tag]
      }));
    }
    setTag("");
  };

  /**
   * Handle change event for question
   *
   * @param questionIndex number
   * @param updatedFields - The updated fields for the question
   */
  const handleQuestionChange = (questionIndex: number, updatedFields: Partial<Question>) => {
    const updatedQuestions = editedQuestionnaire.questions.map((question, optionIndex) =>
      optionIndex === questionIndex ? { ...question, ...updatedFields } : question
    );
    setEditedQuestionnaire((prev) => ({ ...prev, questions: updatedQuestions }));
  };

  /**
   * Handle change event for answer option in question
   * @param questionIndex number
   * @param optionIndex number
   * @param updatedFields - The updated fields for the question
   */
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
   * Function to add a new answer option to a question
   * @param questionIndex - Index of the question
   */
  const handleAddAnswerOption = (questionIndex: number) => {
    const newOption: AnswerOption = {
      id: uuidv4(),
      label: "",
      isCorrect: false
    };
    const updatedOptions = [
      ...editedQuestionnaire.questions[questionIndex].answerOptions,
      newOption
    ];
    handleQuestionChange(questionIndex, { answerOptions: updatedOptions });
  };

  /**
   * Function to remove an answer option from a question
   * @param questionIndex - Index of the question
   * @param optionIndex - Index of the answer option to remove
   */
  const handleRemoveAnswerOption = (questionIndex: number, optionIndex: number) => {
    const updatedOptions = editedQuestionnaire.questions[questionIndex].answerOptions.filter(
      (_, index) => index !== optionIndex
    );
    handleQuestionChange(questionIndex, { answerOptions: updatedOptions });
  };

  /**
   * Functions to add new question to Questionnaire
   *
   * @param questionText string
   * @param answerOptions - The answer options for the question
   */
  const handleAddQuestion = ({
    questionText,
    answerOptions
  }: {
    questionText: string;
    answerOptions: AnswerOption[];
  }) => {
    if (!questionText.trim() || !answerOptions || answerOptions.length === 0) {
      return;
    }
    const validAnswerOptions = answerOptions
      .filter((option) => option.label?.trim())
      .map((option) => ({
        ...option,
        id: option.id || uuidv4()
      }));

    if (validAnswerOptions.length === 0) {
      return;
    }

    setEditedQuestionnaire((prevQuestionnaire) => ({
      ...prevQuestionnaire,
      questions: [
        ...prevQuestionnaire.questions,
        { id: uuidv4(), questionText: questionText.trim(), answerOptions: validAnswerOptions }
      ]
    }));
  };

  /**
   * Function to delete question from Questionnaire
   * @param questionIndex number
   */
  const handleDeleteQuestion = (questionIndex: number) => {
    const filteredQuestions = editedQuestionnaire.questions.filter(
      (_, optionIndex) => optionIndex !== questionIndex
    );
    setEditedQuestionnaire((prev) => ({ ...prev, questions: filteredQuestions }));
  };

  /**
   * Function to count all correct answers in the questionnaire, used for passScore determination
   *
   * @returns number of correct answers
   */
  const countEditedCorrectAnswers = () => {
    return editedQuestionnaire.questions.reduce((count, question) => {
      return count + (question.answerOptions?.filter((option) => option.isCorrect).length || 0);
    }, 0);
  };
  const maxCorrectAnswers = countEditedCorrectAnswers();
  /**
   * Function to handle passScore change
   *
   * @param value number
   */
  const handlePassScoreChange = (value: number) => {
    const maxCorrectAnswers = countEditedCorrectAnswers();
    const passScore = Math.min(value, maxCorrectAnswers);
    setEditedQuestionnaire((prev) => ({ ...prev, passScore }));
  };

  /**
   * Function to update edited questionnaire
   *
   * @returns updated questionnaire
   */
  const updateEditedQuestionnaire = async () => {
    if (!editedQuestionnaire.id) {
      return null;
    }
    setLoading(true);
    try {
      const updatedQuestionnaire = await questionnairesApi.updateQuestionnaires({
        id: editedQuestionnaire.id,
        questionnaire: {
          ...editedQuestionnaire,
          passedUsers: clearPassedUsers ? [] : editedQuestionnaire.passedUsers
        }
      });

      showSnackbar(strings.snackbar.questionnaireUpdated);
      navigate(-1);
      return updatedQuestionnaire;
    } catch (error: any) {
      const errorMessage = await error?.response?.json();
      setError(`${strings.error.questionnaireUpdateFailed}: ${errorMessage?.message || error}`);
    }
    setLoading(false);
  };

  return (
    <>
      <Card
        sx={{ backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary }}
      >
        <CardContent>
          <Typography variant="h5">{strings.questionnaireEdit.title}</Typography>
          <TextField
            label={strings.questionnaireEdit.titleLabel}
            name="title"
            value={editedQuestionnaire.title || ""}
            onChange={handleChange}
            fullWidth
            sx={{ mt: 3, mb: 2 }}
            InputLabelProps={{ style: { color: theme.palette.text.secondary } }}
          />
          <TextField
            label={strings.questionnaireEdit.descriptionLabel}
            name="description"
            value={editedQuestionnaire.description || ""}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
            InputLabelProps={{ style: { color: theme.palette.text.secondary } }}
          />

          {/* Tags Section */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <TagsAutocomplete
                tags={existingTags}
                tag={tag}
                selectedTags={editedQuestionnaire.tags || []}
                handleTagChange={handleTagChange}
                handleSelectedTagChange={handleSelectedTagChange}
                handleEnter={handleEnter}
              />
            </Box>
          </Box>

          {editedQuestionnaire.questions.map((question, questionIndex) => (
            <Card
              key={question.id}
              sx={{ mb: 2, p: 2, border: `1px solid ${theme.palette.divider}` }}
            >
              <TextField
                label={`${strings.questionnaireEdit.question} ${questionIndex + 1}`}
                value={question.questionText}
                onChange={(e) =>
                  handleQuestionChange(questionIndex, { questionText: e.target.value })
                }
                fullWidth
                margin="normal"
                required
                InputLabelProps={{ style: { color: theme.palette.text.secondary } }}
              />

              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                Answer Options:
              </Typography>

              {question.answerOptions.map((option, optionIndex) => (
                <Box key={option.id} sx={{ display: "flex", alignItems: "center", mb: 1 }}>
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
                    placeholder={`${strings.questionnaireEdit.answerOption} ${optionIndex + 1}`}
                    fullWidth
                    size="small"
                  />
                  {question.answerOptions.length > 1 && (
                    <Button
                      onClick={() => handleRemoveAnswerOption(questionIndex, optionIndex)}
                      color="error"
                      size="small"
                      sx={{ ml: 1, minWidth: "auto", px: 1 }}
                    >
                      ✕
                    </Button>
                  )}
                </Box>
              ))}

              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                <Button
                  onClick={() => handleAddAnswerOption(questionIndex)}
                  variant="outlined"
                  size="small"
                  color="primary"
                >
                  + {strings.questionnaireEdit.addAnswerOption}
                </Button>

                <Button
                  onClick={() => handleDeleteQuestion(questionIndex)}
                  variant="contained"
                  color="error"
                  size="small"
                >
                  {strings.questionnaireEdit.deleteQuestion}
                </Button>
              </Box>
            </Card>
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
                  max: maxCorrectAnswers
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
              disabled={loading || !saveEnabled}
              variant="contained"
              size="large"
              color="success"
            >
              {strings.questionnaireEdit.update}
            </Button>
          </CardActions>
        </CardContent>
      </Card>
      <BackButton styles={{ mt: 3, marginBottom: 2 }} />

    </>
  );
};

export default QuestionnairesEditMode;
