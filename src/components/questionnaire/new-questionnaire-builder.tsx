import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Checkbox,
  CircularProgress,
  Popper,
  type PopperProps,
  Slider,
  styled,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import { useAtomValue, useSetAtom } from "jotai";
import { type ChangeEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { errorAtom } from "src/atoms/error";
import { questionnaireTagsAtom } from "src/atoms/questionnaire";
import type { AnswerOption, Question, Questionnaire } from "src/generated/homeLambdasClient";
import { useLambdasApi } from "src/hooks/use-api";
import strings from "src/localization/strings";
import {
  addQuestion,
  countCorrectAnswers,
  createEmptyQuestionnaire,
  editQuestion,
  getValidationTooltipMessage,
  handleQuestionnaireInputChange,
  isFormValid,
  removeQuestion,
  updatePassScore
} from "src/utils/questionnaireBuilderUtils";
import BackButton from "../generics/back-button";
import NewQuestionCard from "./new-question-card";
import QuestionnairePreview from "./questionnaire-preview";

/**
 * New Questionnaire Builder component
 */
const NewQuestionnaireBuilder = () => {
  const navigate = useNavigate();
  const { questionnairesApi } = useLambdasApi();
  const [loading, setLoading] = useState(false);
  const setError = useSetAtom(errorAtom);
  const setQuestionnaireTagsAtom = useSetAtom(questionnaireTagsAtom);
  const existingTags = useAtomValue(questionnaireTagsAtom);
  const [questionnaire, setQuestionnaire] = useState<Questionnaire>(createEmptyQuestionnaire());
  const [tag, setTag] = useState<string>("");
  const isDisabled = !isFormValid(questionnaire);

  /**
   * Function to handle input change in the questionnaire title and description
   * @param event - The change event from the input field
   */
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuestionnaire((prevQuestionnaire) =>
      handleQuestionnaireInputChange(event, prevQuestionnaire)
    );
  };

  /**
   * Function to handle tag input change from Autocomplete
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
    setQuestionnaire((prevQuestionnaire) => ({
      ...prevQuestionnaire,
      tags: value
    }));
  };

  /**
   * Function to handle Enter key press in tag input
   * @param event - The keyboard event
   */
  const handleEnter = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter") return;
    if (tag && !questionnaire.tags?.includes(tag)) {
      setQuestionnaire((prevQuestionnaire) => ({
        ...prevQuestionnaire,
        tags: [...(prevQuestionnaire.tags || []), tag]
      }));
    }
    setTag("");
  };

  /**
   * Function to handle slider that pass value about what is the minimum score to pass the questionnaire
   *
   * @param _ - The event object
   * @param value - The slider value, can be a single number or array of numbers
   */
  const handlePassScoreSliderChange = (_: Event, value: number | number[]) => {
    setQuestionnaire((prevQuestionnaire) => updatePassScore(value, prevQuestionnaire));
  };

  /**
   * Functions to add new question to Questionnaire that is being built
   *
   * @param questionText - The text content of the question to be added
   * @param answerOptions - Array of answer options for the question
   */
  const handleAddQuestion = (questionText: string, answerOptions: AnswerOption[]) => {
    setQuestionnaire((prevQuestionnaire) =>
      addQuestion(questionText, answerOptions, prevQuestionnaire)
    );
  };

  /**
   * Function to delete question from the questionnaire that is being built
   * @param index number- The index of the question to remove
   */
  const removeQuestionFromPreview = (index: number) => {
    setQuestionnaire((prevQuestionnaire) => removeQuestion(index, prevQuestionnaire));
  };
  /**
   * Function to edit question in the questionnaire that is being built
   *
   * @param index - The index of the question to be edited
   * @param updatedQuestion - The new question data to replace the existing question
   */
  const editQuestionInPreview = (index: number, updatedQuestion: Question) => {
    setQuestionnaire((prevQuestionnaire) =>
      editQuestion(index, updatedQuestion, prevQuestionnaire)
    );
  };

  /**
   * Function to close and clear the questionnaire form
   */
  const closeAndClear = async () => {
    setQuestionnaire(createEmptyQuestionnaire());
    setTag("");
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
      // Update tags in atom with new tags from the questionnaire
      const updatedTags = [...new Set<string>(existingTags.concat(questionnaire.tags || []))];
      setQuestionnaireTagsAtom(updatedTags);
      closeAndClear();
      navigate(-1);
      return createdQuestionnaire;
    } catch (error) {
      setError(`${strings.error.questionnaireSaveFailed}, ${error}`);
    } finally {
      setLoading(false);
    }
  };
  const CustomPopper = styled((props: PopperProps) => <Popper {...props} placement="bottom" />)({
    "& .MuiAutocomplete-paper": {
      marginTop: "10px"
    }
  });

  return (
    <>
      <Card
        sx={{
          p: 2,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          height: "100"
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
              <Autocomplete
                multiple
                disableClearable
                freeSolo
                PopperComponent={CustomPopper}
                options={existingTags}
                sx={{ width: "100%" }}
                inputValue={tag}
                value={questionnaire.tags || []}
                onInputChange={handleTagChange}
                onChange={handleSelectedTagChange}
                renderInput={(params) => {
                  return (
                    <TextField
                      {...params}
                      sx={{ width: "100%" }}
                      onKeyDown={handleEnter}
                      label={strings.questionnaireTags.title}
                    />
                  );
                }}
                renderOption={(props, option, { selected }) => (
                  <li
                    {...props}
                    style={{ display: "flex", alignItems: "center" }}
                    key={`tags-option-${option}`}
                  >
                    <Checkbox
                      sx={{
                        marginRight: 2
                      }}
                      checked={selected}
                    />
                    <Box
                      minWidth="5px"
                      style={{ marginRight: "10px" }}
                      component="span"
                      sx={{
                        height: 40,
                        borderRadius: "5px"
                      }}
                    />
                    {option}
                  </li>
                )}
              />
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
              flexDirection: "column"
            }}
          >
            <CardActions
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                padding: 0,
                alignItems: "flex-start",
                flexDirection: { xs: "column", sm: "row" },
                width: "100%"
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  width: "70%",
                  mr: 4
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
                  {strings.newQuestionnaireBuilder.requiredAnswers} {questionnaire.passScore}
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
      <BackButton styles={{ mt: 3, marginBottom: 2 }} />
    </>
  );
};

export default NewQuestionnaireBuilder;
