import {
  Questionnaire,
  AnswerOption,
  Question,
} from "src/generated/homeLambdasClient";

/**
 * Function to handle input change in the questionnaire title and description
 * @param event - The change event from the input field
 * @param questionnaire - The current questionnaire state object
 * @returns Updated questionnaire object with the new input value
 */
export const handleQuestionnaireInputChange = (
  event: React.ChangeEvent<HTMLInputElement>,
  questionnaire: Questionnaire
): Questionnaire => {
  const { name, value } = event.target;
  return {
    ...questionnaire,
    [name]: value
  };
};

/**
 * Function to add a tag to the questionnaire
 * 
 * @param tagInput - The tag to be added
 * @param questionnaire - The current questionnaire state object
 * @param strings - The localization strings object
 * @returns Object containing updated questionnaire and any error message
 */
export const addTag = (
  tagInput: string,
  questionnaire: Questionnaire,
  strings: any
): { updatedQuestionnaire: Questionnaire; error: string | null } => {
  const trimmedTag = tagInput.trim();
  if (!trimmedTag) {
    return { 
      updatedQuestionnaire: questionnaire, 
      error: strings.questionnaireTags.emptyTagError 
    };
  }
  
  const currentTags = questionnaire.tags || [];
  if (currentTags.includes(trimmedTag)) {
    return { 
      updatedQuestionnaire: questionnaire, 
      error: strings.questionnaireTags.duplicateTagError 
    };
  }
  
  const updatedQuestionnaire = {
    ...questionnaire,
    tags: [...currentTags, trimmedTag]
  };
  return { updatedQuestionnaire, error: null };
};

/**
 * Function to remove a tag from the questionnaire
 * 
 * @param tagToRemove - The tag to be removed from the questionnaire
 * @param questionnaire - The current questionnaire state object
 * @returns Updated questionnaire object with the tag removed
 */
export const removeTag = (
  tagToRemove: string,
  questionnaire: Questionnaire
): Questionnaire => {
  const currentTags = questionnaire.tags || [];
  return {
    ...questionnaire,
    tags: currentTags.filter(tag => tag !== tagToRemove)
  };
};

/**
 * Function to update the pass score of the questionnaire
 * 
 * @param value - The new pass score value
 * @param questionnaire - The current questionnaire state object
 * @returns Updated questionnaire object with the new pass score
 */
export const updatePassScore = (
  value: number | number[],
  questionnaire: Questionnaire
): Questionnaire => {
  const passScore = typeof value === 'number' ? value : value[0];
  return {
    ...questionnaire,
    passScore
  };
};

/**
 * Function to add a new question to the questionnaire
 * 
 * @param questionText - The text content of the question to be added
 * @param answerOptions - Array of answer options for the question
 * @param questionnaire - The current questionnaire state object
 * @returns Updated questionnaire object with the new question added
 */
export const addQuestion = (
  questionText: string,
  answerOptions: AnswerOption[],
  questionnaire: Questionnaire
): Questionnaire => {
  const newQuestion: Question = {
    questionText: questionText, // Using questionText to match interface
    answerOptions: answerOptions
  };

  return {
    ...questionnaire,
    questions: [...(questionnaire.questions || []), newQuestion]
  };
};

/**
 * Function to remove a question from the questionnaire
 * 
 * @param index - The index of the question to remove
 * @param questionnaire - The current questionnaire state object
 * @returns Updated questionnaire object with the question removed
 */
export const removeQuestion = (
  index: number,
  questionnaire: Questionnaire
): Questionnaire => {
  const updatedQuestions = [...(questionnaire.questions || [])];
  updatedQuestions.splice(index, 1);
  
  return {
    ...questionnaire,
    questions: updatedQuestions
  };
};

/**
 * Function to edit a question in the questionnaire
 *
 * @param index - The index of the question to be edited
 * @param updatedQuestion - The new question data to replace the existing question
 * @param questionnaire - The current questionnaire state object
 * @returns Updated questionnaire object with the edited question
 */
export const editQuestion = (
  index: number,
  updatedQuestion: Question,
  questionnaire: Questionnaire
): Questionnaire => {
  const updatedQuestions = [...(questionnaire.questions || [])];
  updatedQuestions[index] = updatedQuestion;
  
  return {
    ...questionnaire,
    questions: updatedQuestions
  };
};

/**
 * Function to count the total number of correct answers in a questionnaire
 * 
 * @param questionnaire - The questionnaire to count correct answers for
 * @returns The total count of correct answers across all questions
 */
export const countCorrectAnswers = (questionnaire: Questionnaire): number => {
  if (!questionnaire.questions) return 0;
  
  return questionnaire.questions.reduce((total, question) => {
    if (!question.answerOptions) return total;
    
    const correctAnswersCount = question.answerOptions.filter(
      option => option.isCorrect
    ).length;
    
    return total + correctAnswersCount;
  }, 0);
};

/**
 * Creates an empty questionnaire object with default values
 * 
 * @returns A new empty questionnaire object
 */
export const createEmptyQuestionnaire = (): Questionnaire => {
  return {
    title: "",
    description: "",
    questions: [],
    passScore: 0,
    tags: []
  };
};

/**
 * Enum for validation conditions that replaces string-based error types
 */
export enum ValidationCondition {
  VALID = "valid",
  TITLE_AND_DESCRIPTION_EMPTY = "titleAndDescriptionEmpty",
  TITLE_EMPTY = "titleEmpty",
  DESCRIPTION_EMPTY = "descriptionEmpty",
  NO_QUESTIONS = "noQuestions",
  NO_CORRECT_ANSWERS = "noCorrectAnswers", 
  NO_PASS_SCORE = "noPassScore"
}

/**
 * Validates a questionnaire and returns validation result
 * 
 * @param questionnaire - The questionnaire to validate
 * @returns An object containing isValid flag and the validation condition
 */
export const validateQuestionnaire = (questionnaire: Questionnaire): { 
  isValid: boolean; 
  condition: ValidationCondition;
} => {
  if (!questionnaire.title && !questionnaire.description) {
    return { 
      isValid: false, 
      condition: ValidationCondition.TITLE_AND_DESCRIPTION_EMPTY 
    };
  }
  
  if (!questionnaire.title) {
    return { 
      isValid: false, 
      condition: ValidationCondition.TITLE_EMPTY 
    };
  }
  
  if (!questionnaire.description) {
    return { 
      isValid: false, 
      condition: ValidationCondition.DESCRIPTION_EMPTY 
    };
  }
  
  if (!questionnaire.questions || questionnaire.questions.length === 0) {
    return { 
      isValid: false, 
      condition: ValidationCondition.NO_QUESTIONS 
    };
  }
  
  const hasAnyCorrectAnswers = questionnaire.questions.some(question => 
    question.answerOptions && question.answerOptions.some(option => option.isCorrect)
  );
  
  if (!hasAnyCorrectAnswers) {
    return { 
      isValid: false, 
      condition: ValidationCondition.NO_CORRECT_ANSWERS 
    };
  }
  
  if (questionnaire.passScore === undefined || questionnaire.passScore === null) {
    return { 
      isValid: false, 
      condition: ValidationCondition.NO_PASS_SCORE 
    };
  }
  return { 
    isValid: true, 
    condition: ValidationCondition.VALID 
  };
};

/**
 * Checks if a questionnaire form is valid for submission
 * 
 * @param questionnaire - The questionnaire to validate
 * @returns Boolean indicating whether the form is valid
 */
export const isFormValid = (questionnaire: Questionnaire): boolean => {
  const { isValid } = validateQuestionnaire(questionnaire);
  return isValid;
};

/**
 * Gets appropriate tooltip message for a questionnaire's validation state
 * Using only existing localization strings
 * 
 * @param questionnaire - The questionnaire to get tooltip message for
 * @param strings - The localization strings object
 * @returns Localized tooltip message based on validation result
 */
export const getValidationTooltipMessage = (
  questionnaire: Questionnaire, 
  strings: any
): string => {
  const { condition } = validateQuestionnaire(questionnaire);
  
  if (condition === ValidationCondition.VALID) {
    return ""; 
  }
  
  switch(condition) {
    case ValidationCondition.TITLE_AND_DESCRIPTION_EMPTY:
      return strings.newQuestionnaireBuilder.tooltipBothEmpty;
    case ValidationCondition.TITLE_EMPTY:
      return strings.newQuestionnaireBuilder.tooltipEmptyTitle;
    case ValidationCondition.DESCRIPTION_EMPTY:
      return strings.newQuestionnaireBuilder.tooltipEmptyDescription;
    case ValidationCondition.NO_QUESTIONS:
      return strings.error.questionnaireSaveFailed;
    case ValidationCondition.NO_CORRECT_ANSWERS:
      return strings.error.questionnaireSaveFailed;
    case ValidationCondition.NO_PASS_SCORE:
      return strings.error.questionnaireSaveFailed;
    default:
      return strings.error.generic;
  }
};