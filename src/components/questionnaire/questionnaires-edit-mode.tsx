import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Checkbox,
  Chip,
  FormControlLabel,
  Snackbar,
  SnackbarContent,
  TextField,
  Typography
} from "@mui/material";
import { useEffect, useState } from "react";
import type { Questionnaire, Question, AnswerOption } from "src/generated/homeLambdasClient";
import NewQuestionCard from "./new-question-card";
import { useNavigate } from "react-router";
import { useSetAtom } from "jotai";
import { errorAtom } from "src/atoms/error";
import { useLambdasApi } from "src/hooks/use-api";
import strings from "src/localization/strings";
import { Link } from "react-router-dom";
import { KeyboardReturn } from "@mui/icons-material";
import isEqual from "lodash/isEqual";

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
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [saveEnabled, setSaveEnabled] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [tagError, setTagError] = useState<string | null>(null);

  useEffect(() => {
    if (!editedQuestionnaire.tags) {
      setEditedQuestionnaire(prev => ({...prev, tags: []}));
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
    if (!question.questionText || question.answerOptions.length === 0) {
      return false;
    }
    const hasEmptyLabel = question.answerOptions.some((option) => !option.label.trim());
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
   * Function to add a new tag with validation
   */
  const handleAddTag = () => {
    if (!newTag.trim()) {
      setTagError(strings.questionnaireTags.emptyTagError);
      return;
    }
  
    const trimmedTag = newTag.trim();
    if (editedQuestionnaire.tags?.some(tag => tag.toLowerCase() === trimmedTag.toLowerCase())) {
      setTagError(strings.questionnaireTags.duplicateTagError);
      return;
    }
  
    setEditedQuestionnaire(prev => ({
      ...prev,
      tags: [...(prev.tags || []), trimmedTag]
    }));
  
    setNewTag("");
    setTagError(null);
  };

  /**
   * Function to remove a tag
   * 
   * @param tagToRemove - type string
   */
  const handleRemoveTag = (tagToRemove: string) => {
    setEditedQuestionnaire(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  /**
   * Handle key press event for tag input
   * 
   * @param event - Key press event
   */
  const handleTagKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddTag();
    }
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
   *
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
   * Functions to add new question to Questionnaire
   *
   * @param questionText string
   * @param answerOptions - The answer options for the question
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

  /**
   * Function to delete question from Questionnaire
   *
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
      setSnackbarOpen(true);
      return updatedQuestionnaire;
    } catch (error) {
      setError(`${strings.error.questionnaireUpdateFailed}, ${error}`);
    }
    setLoading(false);
  };

  /**
   * Function to handle snackbar close event
   */
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
    navigate(-1);
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
            sx={{ mb: 2 }}
          />
          
          {/* Tags Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>{(strings as any).tags?.title || "Tags"}</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              {editedQuestionnaire.tags?.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                  color="primary"
                  variant="outlined"
                />
              ))}
              {(!editedQuestionnaire.tags || editedQuestionnaire.tags.length === 0) && (
                <Typography variant="body2" color="text.secondary">
                  {strings.questionnaireTags.noTags}
                </Typography>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                <TextField
                  label={(strings as any).tags?.addTagPlaceholder || "Add a tag"}
                  value={newTag}
                  onChange={(e) => {
                    setNewTag(e.target.value);
                    if (tagError) setTagError(null);
                  }}
                  onKeyDown={handleTagKeyDown}
                  size="small"
                  fullWidth
                  error={!!tagError}
                  helperText={tagError}
                />
                <Button 
                  variant="contained" 
                  onClick={handleAddTag}
                  size="small"
                  sx={{ 
                    height: '40px',
                    minWidth: '90px',
                    textTransform: 'uppercase',
                    backgroundColor: '#212121',
                    '&:hover': {
                      backgroundColor: '#000000'
                    }
                  }}
                >
                  {strings.questionnaireTags.addTag}
                </Button>
              </Box>
            </Box>
          </Box>
          
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
              <Box>
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
                sx={{ color: "black", float: "right", mb: 2 }}
                size="small"
                onClick={() => handleDeleteQuestion(questionIndex)}
                variant="contained"
                color="secondary"
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
      <Card sx={{ mt: 2, width: "100%" }}>
        <Link to={"/admin/questionnaire"} style={{ textDecoration: "none" }}>
          <Button variant="contained" sx={{ p: 2, width: "100%" }}>
            <KeyboardReturn sx={{ marginRight: "10px" }} />
            <Typography>{strings.questionnaireScreen.back}</Typography>
          </Button>
        </Link>
      </Card>
      <Snackbar open={snackbarOpen} autoHideDuration={2000} onClose={handleSnackbarClose}>
        <SnackbarContent
          message={strings.questionnaireEdit.snackbarMessageSuccess}
          sx={{
            backgroundColor: "green",
            color: "white"
          }}
        />
      </Snackbar>
    </>
  );
};

export default QuestionnairesEditMode;