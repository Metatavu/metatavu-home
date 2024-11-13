import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  Grid,
  List,
  ListItem,
  ListItemText,
  Slider,
  TextField,
  Typography
} from "@mui/material";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { useState, type ChangeEvent } from "react";
import { Link } from "react-router-dom";
import NewQuestionnaireCard from "../questionnaire/new-questionnaire-card";
import { KeyboardReturn } from "@mui/icons-material";
import UserRoleUtils from "src/utils/user-role-utils";
import type { Questionnaire, Options } from "src/generated/homeLambdasClient";
import strings from "src/localization/strings";
import { useLambdasApi } from "src/hooks/use-api";
import { useSetAtom } from "jotai";
import { errorAtom } from "src/atoms/error";

/**
 * New Questionnaire Screen component
 */
const NewQuestionnaireScreen = () => {
  const adminMode = UserRoleUtils.adminMode();
  const { questionnairesApi } = useLambdasApi();
  const [loading, setLoading] = useState(false);
  const setError = useSetAtom(errorAtom);
  const [questionnaire, setQuestionnaire] = useState<Questionnaire>({
    title: "",
    description: "",
    options: [],
    passScore: 0
  });

  /**
   * Function to handle input change in the questionnaire title and description
   * 
   * @param event
   */
  const handleQuestionnaireInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setQuestionnaire((prevQuestionnaire) => ({
      ...prevQuestionnaire,
      [name]: value
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
      passScore: value as number
    }));
  };

  /**
   * Functions to add new question to Questionnaire that is being built
   * 
   * @param questionText string
   * @param list of QuestionOptions
   */
  const handleAddQuestion = (questionText: string, options: Options[]) => {
    setQuestionnaire((prevQuestionnaire) => ({
      ...prevQuestionnaire,
      options: [
        ...prevQuestionnaire.options,
        { questionText, options }
      ]
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
      options: prevQuestionnaire.options.filter((_, i) => i !== index)
    }));
  };

  /**
   * Function to count all correct answers in the questionnaire, used for passScore determination
   */
  const countCorrectAnswers = () => {
    return questionnaire.options.reduce((count, question) => {
      return count + (question.options?.filter((option) => option.value === true).length || 0);
    }, 0);
  };

  /**
   * Function to close and clear the questionnaire form
   */
  const closeAndClear = async () => {
    setQuestionnaire({
      title: "",
      description: "",
      options: [],
      passScore: 0
    });
    setLoading(false);
  };

  /**
   * Function to save the new questionnaire
   */
  const saveQuestionnaire = async () => {
    setLoading(true);
    try {
      const createdQuestionnaire = await questionnairesApi.createQuestionnaires({
        questionnaire: {
          title: questionnaire.title,
          description: questionnaire.description,
          options: questionnaire.options,
          passScore: questionnaire.passScore
        }
      });
      closeAndClear();
      return createdQuestionnaire;
    } catch (error) {
      setError(`${strings.error.questionnaireSaveFailed}, ${error}`);
    }
  };

  return (
    <>
      {/* Card containing functions to build new Questionnaire */}
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
            {strings.newQuestionnaireScreen.makeNewQuestionnaire}
          </Typography>
          <TextField
            name="title"
            label={strings.newQuestionnaireScreen.title}
            placeholder={strings.newQuestionnaireScreen.insertTitle}
            value={questionnaire.title}
            onChange={handleQuestionnaireInputChange}
            variant="outlined"
            fullWidth
            sx={{ mt: 2, mb: 2 }}
          />
          <TextField
            name="description"
            label={strings.newQuestionnaireScreen.description}
            placeholder={strings.newQuestionnaireScreen.insertDescription}
            value={questionnaire.description}
            onChange={handleQuestionnaireInputChange}
            variant="outlined"
            fullWidth
            sx={{ mt: 2, mb: 4 }}
          />
          <NewQuestionnaireCard handleAddQuestion={handleAddQuestion} />
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
            <Box sx={{ display: "flex", flexDirection: "column", width: "75%", mr: 2 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", mb: 1, mt: 3 }}
              >
                {strings.newQuestionnaireScreen.countedAnswers} {countCorrectAnswers()}
              </Typography>
              <Typography variant="h6" gutterBottom sx={{ mb: 1, mt: 1 }}>
                {strings.newQuestionnaireScreen.requiredAnswers} {questionnaire.passScore}
              </Typography>
              <Slider
                value={questionnaire.passScore}
                onChange={handlePassScoreSliderChange}
                step={1}
                marks
                min={0}
                max={countCorrectAnswers()}
                valueLabelDisplay="auto"
                sx={{ mt: 1, width: "70%" }}
              />
            </Box>
            <Button
              sx={{ display: "flex", alignItems: "center", mt: 8 }}
              id="save-submit"
              size="large"
              variant="contained"
              color="success"
              onClick={saveQuestionnaire}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                strings.newQuestionnaireScreen.saveButton
              )}
            </Button>
          </CardActions>
        </CardContent>
      </Card>
      <Card sx={{ mt: 2, width: "100%" }}>
        <Link
          to={adminMode ? "/admin/questionnaire" : "/questionnaire"}
          style={{ textDecoration: "none" }}
        >
          <Button variant="contained" sx={{ p: 2, width: "100%" }}>
            <KeyboardReturn sx={{ marginRight: "10px" }} />
            <Typography>{strings.newQuestionnaireScreen.back}</Typography>
          </Button>
        </Link>
      </Card>
      {/* Card containing questions preview */}
      <Card
        sx={{
          p: 2,
          mt: 2,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          height: "100"
        }}
      >
        <CardContent>
          <Grid container sx={{ flexGrow: 1 }}>
            <Grid item xs={12}>
              <Typography variant="h4" gutterBottom>
                {strings.newQuestionnaireScreen.preview}
              </Typography>
            </Grid>
            <Typography variant="h5" gutterBottom>
              {questionnaire.title}
            </Typography>
            {questionnaire.options.map((q, index) => (
              <Grid item xs={12} key={index} sx={{ mb: 2 }}>
                <Card sx={{ p: 2 }}>
                  <Typography>{q.questionText}</Typography>
                  <List component="ol">
                    {q.options?.map((option, idx) => (
                      <ListItem component="li" key={idx}>
                        <ListItemText
                          primary={`${option.label} ${
                            strings.newQuestionnaireScreen.is
                          } ${option.value?.toString() || "false"}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => removeQuestionFromPreview(index)}
                  >
                    <DeleteForeverIcon sx={{ color: "red", mr: 2 }} />
                    {strings.newQuestionnaireScreen.removeFromPreview}
                  </Button>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </>
  );
};

export default NewQuestionnaireScreen;
