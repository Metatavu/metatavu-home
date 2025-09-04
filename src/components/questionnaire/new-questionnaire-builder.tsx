import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  Slider,
  TextField,
  Tooltip,
  Typography,
  Chip,
  InputAdornment,
} from "@mui/material";
import { useState, type ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import NewQuestionCard from "./new-question-card";
import { KeyboardReturn } from "@mui/icons-material";
import LabelIcon from "@mui/icons-material/Label";
import UserRoleUtils from "src/utils/user-role-utils";
import type {
  Questionnaire,
  AnswerOption,
  Question,
} from "src/generated/homeLambdasClient";
import strings from "src/localization/strings";
import { useLambdasApi } from "src/hooks/use-api";
import { useSetAtom } from "jotai";
import { errorAtom } from "src/atoms/error";
import QuestionnairePreview from "./questionnaire-preview";
import {
  handleQuestionnaireInputChange,
  addTag,
  removeTag,
  updatePassScore,
  addQuestion,
  removeQuestion,
  editQuestion,
  countCorrectAnswers,
  getValidationTooltipMessage,
  createEmptyQuestionnaire,
  isFormValid
} from "src/utils/questionnaireBuilderUtils";

/**
 * New Questionnaire Builder component
 */
const NewQuestionnaireBuilder = () => {
  const adminMode = UserRoleUtils.adminMode();
  const navigate = useNavigate();
  const { questionnairesApi } = useLambdasApi();
  const [loading, setLoading] = useState(false);
  const setError = useSetAtom(errorAtom);
  const [questionnaire, setQuestionnaire] = useState<Questionnaire>(createEmptyQuestionnaire());
  const [tagInput, setTagInput] = useState<string>("");
  const [tagError, setTagError] = useState<string | null>(null);
  const isDisabled = !isFormValid(questionnaire);

 /**
 * Function to handle input change in the questionnaire title and description
 * @param event - The change event from the input field
 */
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuestionnaire(prevQuestionnaire => 
      handleQuestionnaireInputChange(event, prevQuestionnaire)
    );
  };

  /**
 * Function to handle tag input change
 * @param event - The change event from the input field that contains the new tag value
 */
  const handleTagInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTagInput(event.target.value);
    if (tagError) setTagError(null);
  };

  /**
   * Function to handle adding a tag
   */
  const handleAddTag = () => {
    const { updatedQuestionnaire, error } = addTag(tagInput, questionnaire, strings);
    
    if (error) {
      setTagError(error);
      return;
    }
    
    setQuestionnaire(updatedQuestionnaire);
    setTagInput("");
    setTagError(null);
  };

  /**
   * Function to handle key press in tag input
   */
  const handleTagKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddTag();
    }
  };

 /**
 * Function to remove a tag from the questionnaire
 * 
 * @param {string} tagToRemove - The tag to be removed from the questionnaire
 */
  const handleRemoveTag = (tagToRemove: string) => {
    setQuestionnaire(prevQuestionnaire => 
      removeTag(tagToRemove, prevQuestionnaire)
    );
  };

 /**
 * Function to handle slider that pass value about what is the minimum score to pass the questionnaire
 * 
 * @param _ - The event object
 * @param value - The slider value, can be a single number or array of numbers
 */
  const handlePassScoreSliderChange = (_: Event, value: number | number[]) => {
    setQuestionnaire(prevQuestionnaire => 
      updatePassScore(value, prevQuestionnaire)
    );
  };

 /**
 * Functions to add new question to Questionnaire that is being built
 * 
 * @param questionText - The text content of the question to be added
 * @param answerOptions - Array of answer options for the question
 */
  const handleAddQuestion = (questionText: string, answerOptions: AnswerOption[]) => {
    setQuestionnaire(prevQuestionnaire => 
      addQuestion(questionText, answerOptions, prevQuestionnaire)
    );
  };

  /**
   * Function to delete question from the questionnaire that is being built
   * @param index number- The index of the question to remove
*/
  const removeQuestionFromPreview = (index: number) => {
    setQuestionnaire(prevQuestionnaire => 
      removeQuestion(index, prevQuestionnaire)
    );
  };
/**
 * Function to edit question in the questionnaire that is being built
 *
 * @param index - The index of the question to be edited
 * @param updatedQuestion - The new question data to replace the existing question
 */
  const editQuestionInPreview = (index: number, updatedQuestion: Question) => {
    setQuestionnaire(prevQuestionnaire => 
      editQuestion(index, updatedQuestion, prevQuestionnaire)
    );
  };

  /**
   * Function to close and clear the questionnaire form
   */
  const closeAndClear = async () => {
    setQuestionnaire(createEmptyQuestionnaire());
    setTagInput("");
    setTagError(null);
  };

  /**
   * Function to save the new questionnaire
   */
  const saveQuestionnaire = async () => {
    // Button is already disabled if form is invalid, so no need for validation here
    setLoading(true);
    try {
      const createdQuestionnaire = await questionnairesApi.createQuestionnaires({
        questionnaire: {
          title: questionnaire.title,
          description: questionnaire.description,
          questions: questionnaire.questions,
          passScore: questionnaire.passScore,
          tags: questionnaire.tags || [],
          passedUsers: []
        }
      });
      closeAndClear();
      navigate(-1);
      return createdQuestionnaire;
    } catch (error) {
      setError(`${strings.error.questionnaireSaveFailed}, ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card
        sx={{
          p: 2,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          height: "100",
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Typography variant="h4" gutterBottom>
            {strings.newQuestionnaireBuilder.makeNewQuestionnaire}
          </Typography>
          <TextField
            name="title"
            label={strings.newQuestionnaireBuilder.title}
            placeholder={strings.newQuestionnaireBuilder.insertTitle}
            value={questionnaire.title}
            onChange={handleInputChange}
            variant="outlined"
            fullWidth
            required
            sx={{ mt: 2, mb: 2 }}
          />
          <TextField
            name="description"
            label={strings.newQuestionnaireBuilder.description}
            placeholder={strings.newQuestionnaireBuilder.insertDescription}
            value={questionnaire.description}
            onChange={handleInputChange}
            variant="outlined"
            fullWidth
            required
            sx={{ mt: 2, mb: 4 }}
          />

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              {strings.questionnaireTags.title}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <TextField
                value={tagInput}
                onChange={handleTagInputChange}
                onKeyDown={handleTagKeyDown}
                placeholder={strings.questionnaireTags.addTagPlaceholder}
                variant="outlined"
                size="small"
                fullWidth
                error={!!tagError}
                helperText={tagError}
                sx={{ mr: 1 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LabelIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddTag}
                size="small"
                sx={{
                  height: "40px",
                  minWidth: "90px",
                  textTransform: "lowercase",
                  backgroundColor: "#212121",
                  "&:hover": {
                    backgroundColor: "#000000",
                  },
                }}
              >
                {strings.questionnaireTags.addTag}
              </Button>
            </Box>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
              {questionnaire.tags && questionnaire.tags.length > 0 ? (
                questionnaire.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                    color="primary"
                    variant="outlined"
                    icon={<LabelIcon />}
                  />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {strings.questionnaireTags.noTags}
                </Typography>
              )}
            </Box>
          </Box>
          
          <NewQuestionCard
            handleAddQuestion={(params) =>
              handleAddQuestion(params.questionText, params.answerOptions)
            }
          />
          <Card
            sx={{
              p: 2,
              mt: 4,
              width: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <CardActions
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                padding: 0,
                alignItems: "flex-start",
                flexDirection: { xs: "column", sm: "row" },
                width: "100%",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  width: "70%",
                  mr: 4,
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center", mb: 1, mt: 1 }}
                >
                  {strings.newQuestionnaireBuilder.countedAnswers}{" "}
                  {countCorrectAnswers(questionnaire)}
                </Typography>
                <Typography variant="h6" gutterBottom sx={{ mb: 1, mt: 1 }}>
                  {strings.newQuestionnaireBuilder.requiredAnswers}{" "}
                  {questionnaire.passScore}
                </Typography>
                <Slider
                  value={questionnaire.passScore}
                  onChange={handlePassScoreSliderChange}
                  step={1}
                  marks
                  min={0}
                  max={countCorrectAnswers(questionnaire)}
                  valueLabelDisplay="auto"
                  sx={{ mt: 1, mb: 1, width: "70%" }}
                />
              </Box>
              <Tooltip 
                title={getValidationTooltipMessage(questionnaire, strings)} 
                placement="bottom"
                disableHoverListener={isFormValid(questionnaire)}
              >
                <Box>
                  <Button
                    sx={{ display: "flex", alignItems: "center", mt: 6, mr: 4 }}
                    id="save-submit"
                    size="large"
                    variant="contained"
                    color="success"
                    onClick={saveQuestionnaire}
                    disabled={loading || isDisabled}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      strings.newQuestionnaireBuilder.saveButton
                    )}
                  </Button>
                </Box>
              </Tooltip>
            </CardActions>
          </Card>
        </CardContent>
      </Card>
      <QuestionnairePreview
        questionnaire={questionnaire}
        removeQuestionFromPreview={removeQuestionFromPreview}
        editQuestionInPreview={editQuestionInPreview}
      />
      <Card sx={{ mt: 2, mb: 2, width: "100%" }}>
        <Link
          to={adminMode ? "/admin/questionnaire" : "/questionnaire"}
          style={{ textDecoration: "none" }}
        >
          <Button variant="contained" sx={{ p: 2, width: "100%" }}>
            <KeyboardReturn sx={{ marginRight: "10px" }} />
            <Typography>{strings.newQuestionnaireBuilder.back}</Typography>
          </Button>
        </Link>
      </Card>
    </>
  );
};

export default NewQuestionnaireBuilder;