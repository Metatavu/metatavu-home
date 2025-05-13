import type { ChangeEvent } from "react";
import type { Question, AnswerOption, Questionnaire } from "src/generated/homeLambdasClient";
import strings from "src/localization/strings";

/**
 * Function to handle input change in the questionnaire title and description
 *
 * @param event Change event from input
 * @param questionnaire Current questionnaire state
 * @returns Updated questionnaire object
 */
export const handleQuestionnaireInputChange = (
  event: ChangeEvent<HTMLInputElement>,
  questionnaire: Questionnaire
): Questionnaire => {
  const { name, value } = event.target;
  return {
    ...questionnaire,
    [name]: value,
  };
};

/**
 * Function to handle adding a tag to the questionnaire
 * 
 * @param tagInput Current tag input value
 * @param questionnaire Current questionnaire state
 * @returns Object with updated questionnaire and error message if any
 */
export const addTag = (
  tagInput: string, 
  questionnaire: Questionnaire
): { updatedQuestionnaire: Questionnaire; error: string | null } => {
  const trimmedTag = tagInput.trim();
  
  if (!trimmedTag) {
    return { 
      updatedQuestionnaire: questionnaire, 
      error: strings.questionnaireTags.emptyTagError 
    };
  }
  
  const tagExists = questionnaire.tags?.some(
    (tag) => tag.toLowerCase() === trimmedTag.toLowerCase()
  );
  
  if (tagExists) {
    return { 
      updatedQuestionnaire: questionnaire, 
      error: strings.questionnaireTags.duplicateTagError 
    };
  }

  return {
    updatedQuestionnaire: {
      ...questionnaire,
      tags: [...questionnaire.tags || [], trimmedTag],
    },
    error: null
  };
};

/**
 * Function to remove a tag from the questionnaire
 * 
 * @param tagToRemove Tag to be removed
 * @param questionnaire Current questionnaire state
 * @returns Updated questionnaire object
 */
export const removeTag = (
  tagToRemove: string,
  questionnaire: Questionnaire
): Questionnaire => {
  return {
    ...questionnaire,
    tags: questionnaire.tags?.filter((tag) => tag !== tagToRemove) || [],
  };
};

/**
 * Function to handle slider that sets the minimum score to pass the questionnaire
 *
 * @param value New slider value
 * @param questionnaire Current questionnaire state
 * @returns Updated questionnaire object
 */
export const updatePassScore = (
  value: number | number[],
  questionnaire: Questionnaire
): Questionnaire => {
  return {
    ...questionnaire,
    passScore: value as number,
  };
};

/**
 * Functions to add new question to Questionnaire that is being built
 *
 * @param questionText Question text
 * @param answerOptions Array of answer options
 * @param questionnaire Current questionnaire state
 * @returns Updated questionnaire object
 */
export const addQuestion = (
  questionText: string, 
  answerOptions: AnswerOption[],
  questionnaire: Questionnaire
): Questionnaire => {
  return {
    ...questionnaire,
    questions: [
      ...questionnaire.questions,
      { questionText, answerOptions },
    ],
  };
};

/**
 * Function to delete question from the questionnaire that is being built
 *
 * @param index Index of the question to remove
 * @param questionnaire Current questionnaire state
 * @returns Updated questionnaire object
 */
export const removeQuestion = (
  index: number,
  questionnaire: Questionnaire
): Questionnaire => {
  return {
    ...questionnaire,
    questions: questionnaire.questions.filter((_, i) => i !== index),
  };
};

/**
 * Function to edit question in the questionnaire that is being built
 *
 * @param index Index of the question to edit
 * @param updatedQuestion Updated question data
 * @param questionnaire Current questionnaire state
 * @returns Updated questionnaire object
 */
export const editQuestion = (
  index: number, 
  updatedQuestion: Question,
  questionnaire: Questionnaire
): Questionnaire => {
  return {
    ...questionnaire,
    questions: questionnaire.questions.map((question, i) =>
      i === index ? updatedQuestion : question
    ),
  };
};

/**
 * Function to count all correct answers in the questionnaire, used for passScore determination
 * 
 * @param questionnaire Current questionnaire state
 * @returns Number of correct answers
 */
export const countCorrectAnswers = (questionnaire: Questionnaire): number => {
  return questionnaire.questions.reduce((count, question) => {
    return (
      count +
      (question.answerOptions?.filter((option) => option.isCorrect).length ||
        0)
    );
  }, 0);
};

/**
 * Function to check and set the tooltip message based on form state
 * 
 * @param questionnaire Current questionnaire state
 * @returns Tooltip message
 */
export const getTooltipMessage = (questionnaire: Questionnaire): string => {
  if (!questionnaire.title || !questionnaire.description) {
    return "Please provide both title and description";
  }

  if (!questionnaire.questions || questionnaire.questions.length === 0) {
    return "Please add at least one question";
  }

  const hasAnyCorrectAnswers = questionnaire.questions.some(question => 
    question.answerOptions && question.answerOptions.some(option => option.isCorrect)
  );

  if (!hasAnyCorrectAnswers) {
    return "Please mark at least one answer as correct by checking the box";
  }

  if (questionnaire.passScore === undefined || questionnaire.passScore === null) {
    return "Please set a required pass score using the slider";
  }

  return "Save questionnaire";
};

/**
 * Function to create empty questionnaire object
 * 
 * @returns Empty questionnaire object
 */
export const createEmptyQuestionnaire = (): Questionnaire => {
  return {
    title: "",
    description: "",
    questions: [],
    passScore: 0,
    tags: [],
  };
};

/**
 * Function to check if form is valid for submission
 * 
 * @param questionnaire Current questionnaire state
 * @returns Boolean indicating if form is valid
 */
export const isFormValid = (questionnaire: Questionnaire): boolean => {
  // Check required fields
  if (!questionnaire.title || !questionnaire.description) {
    return false;
  }
  if (!questionnaire.questions || questionnaire.questions.length === 0) {
    return false;
  }
  // Check if any question has at least one correct answer
  const hasAnyCorrectAnswers = questionnaire.questions.some(question => 
    question.answerOptions && question.answerOptions.some(option => option.isCorrect)
  );

  if (!hasAnyCorrectAnswers) {
    return false;
  }

  if (questionnaire.passScore === undefined || questionnaire.passScore === null) {
    return false;
  }
  return true;
};