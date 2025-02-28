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

/**
 * New Questionnaire Builder component
 */
const NewQuestionnaireBuilder = () => {
  const adminMode = UserRoleUtils.adminMode();
  const navigate = useNavigate();
  const { questionnairesApi } = useLambdasApi();
  const [loading, setLoading] = useState(false);
  const setError = useSetAtom(errorAtom);
  const [questionnaire, setQuestionnaire] = useState<Questionnaire>({
    title: "",
    description: "",
    questions: [],
    passScore: 0,
    tags: [], 
  });

  const [tagInput, setTagInput] = useState<string>("");
  const [tagError, setTagError] = useState<string | null>(null);
  
  const isDisabled = !questionnaire.title || !questionnaire.description;
  /**
   * Function to handle input change in the questionnaire title and description
   *
   * @param event
   */
  const handleQuestionnaireInputChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;
    setQuestionnaire((prevQuestionnaire) => ({
      ...prevQuestionnaire,
      [name]: value,
    }));
  };

  /**
   * Function to handle tag input change
   * @param event
   */
  const handleTagInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTagInput(event.target.value);
    if (tagError) setTagError(null);
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim(); 
    if (!trimmedTag) {
      setTagError("Tag cannot be empty");
      return;
    }

    const tagExists = questionnaire.tags?.some(
      (tag) => tag.toLowerCase() === trimmedTag.toLowerCase()
    );
    if (tagExists) {
      setTagError("Tag already exists!");
      return;
    }

    setQuestionnaire((prevQuestionnaire) => ({
      ...prevQuestionnaire,
      tags: [...prevQuestionnaire.tags || [], trimmedTag],
    }));

    setTagInput("");
    setTagError(null);
  };

  /**
   * Function to handle key press in tag input
   * @param event
   */
  const handleTagKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddTag();
    }
  };

  /**
   * Function to remove a tag from the questionnaire'
   * @param tagToRemove string
   */
  const handleRemoveTag = (tagToRemove: string) => {
    setQuestionnaire((prevQuestionnaire) => ({
      ...prevQuestionnaire,
      tags: prevQuestionnaire.tags?.filter((tag) => tag !== tagToRemove) || [],
    }));
  };

  /**
   * Function to handle slider that pass value about what is the minimum score to pass the questionnaire
   *
   * @param event
   * @param value number 
   */
  const handlePassScoreSliderChange = (_: Event, value: number | number[]) => {
    setQuestionnaire((prevQuestionnaire) => ({
      ...prevQuestionnaire,
      passScore: value as number,
    }));
  };

  /**
   * Functions to add new question to Questionnaire that is being built
   *
   * @param questionText string
   * @param answerOptions object
   */
  const handleAddQuestion = (questionText: string, answerOptions: AnswerOption[]) => {
    setQuestionnaire((prevQuestionnaire) => ({
      ...prevQuestionnaire,
      questions: [
        ...prevQuestionnaire.questions,
        { questionText, answerOptions },
      ],
    }));
  };

  /**
   * Function to delete question from the questionnaire that is being built
   *
   * @param index
   */
  const removeQuestionFromPreview = (index: number) => {
    setQuestionnaire((prevQuestionnaire) => ({
      ...prevQuestionnaire,
      questions: prevQuestionnaire.questions.filter((_, i) => i !== index),
    }));
  };

  /**
   * Function to edit question in the questionnaire that is being built
   *
   * @param index number
   * @param updatedQuestion object
   */
  const editQuestionInPreview = (index: number, updatedQuestion: Question) => {
    setQuestionnaire((prev) => ({
      ...prev,
      questions: prev.questions.map((question, i) =>
        i === index ? updatedQuestion : question
      ),
    }));
  };

  /**
   * Function to count all correct answers in the questionnaire, used for passScore determination
   */
  const countCorrectAnswers = () => {
    return questionnaire.questions.reduce((count, question) => {
      return (
        count +
        (question.answerOptions?.filter((option) => option.isCorrect).length ||
          0)
      );
    }, 0);
  };

  /**
   * Function to close and clear the questionnaire form
   */
  const closeAndClear = async () => {
    setQuestionnaire({
      title: "",
      description: "",
      questions: [],
      passScore: 0,
      tags: [],
    });
    setTagInput("");
    setTagError(null);
  };

  /**
   * Function to check and set the tooltip message and isDisabled state
   */
  const renderUpdatedTooltips = () => {
    const isTitleEmpty = !questionnaire.title.trim();
    const isDescriptionEmpty = !questionnaire.description.trim();

    if (isTitleEmpty && isDescriptionEmpty) {
      return strings.newQuestionnaireBuilder.tooltipBothEmpty;
    }
    if (isTitleEmpty) {
      return strings.newQuestionnaireBuilder.tooltipEmptyTitle;
    }
    if (isDescriptionEmpty) {
      return strings.newQuestionnaireBuilder.tooltipEmptyDescription;
    }
    return "";
  };

  /**
   * Function to save the new questionnaire
   */
  const saveQuestionnaire = async () => {
    setLoading(true);
    try {
      const createdQuestionnaire = await questionnairesApi.createQuestionnaires(
        {
          questionnaire: {
            title: questionnaire.title,
            description: questionnaire.description,
            questions: questionnaire.questions,
            passScore: questionnaire.passScore,
            tags: questionnaire.tags, 
          },
        }
      );
      closeAndClear();
      navigate(-1);
      return createdQuestionnaire;
    } catch (error) {
      setError(`${strings.error.questionnaireSaveFailed}, ${error}`);
    }
    setLoading(false);
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
            onChange={handleQuestionnaireInputChange}
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
            onChange={handleQuestionnaireInputChange}
            variant="outlined"
            fullWidth
            required
            sx={{ mt: 2, mb: 4 }}
          />

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              {"Tags"}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <TextField
                value={tagInput}
                onChange={handleTagInputChange}
                onKeyDown={handleTagKeyDown}
                placeholder="Add a tag..."
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
                  textTransform: "uppercase",
                  backgroundColor: "#212121",
                  "&:hover": {
                    backgroundColor: "#000000",
                  },
                }}
              >
                {"ADD TAG"}
              </Button>
            </Box>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
              {questionnaire.tags && questionnaire.tags.length > 0 ? (
                questionnaire.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                    color="primary"
                    variant="outlined"
                    icon={<LabelIcon />}
                  />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {"No tags added yet"}
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
                  {countCorrectAnswers()}
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
                  max={countCorrectAnswers()}
                  valueLabelDisplay="auto"
                  sx={{ mt: 1, mb: 1, width: "70%" }}
                />
              </Box>
              <Tooltip title={renderUpdatedTooltips()} placement="bottom">
                <span>
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
                </span>
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
