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
  
  const MAX_TAG_LENGTH = 50;
  if (trimmedTag.length > MAX_TAG_LENGTH) {
    return {
      updatedQuestionnaire: questionnaire,
      error: strings.questionnaireTags.tagTooLongError.replace("{max}", MAX_TAG_LENGTH.toString())
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
  
  const MAX_TAGS = 10;
  if (questionnaire.tags && questionnaire.tags.length >= MAX_TAGS) {
    return {
      updatedQuestionnaire: questionnaire,
      error: strings.questionnaireTags.maxTagsError
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
  return !!questionnaire.title && !!questionnaire.description;
};
