import QuestionnairePreview from "src/components/questionnaire/questionnaire-preview";
import en from "./en.json";
import fi from "./fi.json";
import LocalizedStrings, { type LocalizedStringsMethods } from "localized-strings";

/**
 * Localized strings
 */
export interface Localized extends LocalizedStringsMethods {
  /**
   * Translations related to generic words
   */
  placeHolder: {
    notYetImplemented: string;
    pleaseWait: string;
  };
  label: {
    currentLocaleLabel: string;
  };
  /**
   * Translations related to header
   */
  header: {
    hello: string;
    logout: string;
    home: string;
    timebank: string;
    vacations: string;
    onCall: string;
    admin: string;
    changeLanguage: string;
    openSettings: string;
    openUserMenu: string;
    logoAlt: string;
  };
  /**
   * Translations related to errors
   */
  error: {
    oops: string;
    generic: string;
    totalTimeFetch: string;
    totalTimeNotFound: string;
    personsFetch: string;
    dailyEntriesFetch: string;
    dailyEntriesNotFound: string;
    fetchFailedGeneral: string;
    fetchFailedNoEntriesGeneral: string;
    fetchSlackAvatarsFailed: string;
    questionnaireSaveFailed: string;
    questionnaireLoadFailed: string;
    questionnaireDeleteFailed: string;
    fetchFailedFlextime: string;
    noSeveraUserId: string;
    noFlextimeData: string;
  };
  /**
   * Translations related to localization
   */
  localization: {
    en: string;
    fi: string;
    time: string;
  };
  /**
   * Translations related to timebank
   */
  timebank: {
    [key: string]: string;
    balance: string;
    yourBalanceIs: string;
    logged: string;
    expected: string;
    billableProjectTime: string;
    nonBillableProjectTime: string;
    internalTime: string;
    billableHours: string;
    timeperiod: string;
    noData: string;
    selectEntry: string;
    latestEntry: string;
    barChartDescription: string;
    pieChartDescription: string;
    byrange: string;
    viewAllTimeEntries: string;
    selectTimespan: string;
    atTheEndOf: string;
    searchPlaceholder: string;
    employeeBalances: string;
  };
  /**
   * Translations related to sprint view
   */
  sprint: {
    sprintview: string;
    myAllocation: string;
    allocation: string;
    timeAllocated: string;
    timeEntries: string;
    allocationLeft: string;
    noAllocation: string;
    assigned: string;
    taskStatus: string;
    taskPriority: string;
    estimatedTime: string;
    taskName: string;
    showMyTasks: string;
    toDo: string;
    inProgress: string;
    allTasks: string;
    notFound: string;
    projectName: string;
    search: string;
    unAllocated: string;
    sprintDate: string;
    completed: string;
    current: string;
  };
  /**
   * General time-related expressions
   */
  timeExpressions: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
    day: string;
    week: string;
    month: string;
    year: string;
    allTime: string;
    startDate: string;
    endDate: string;
  };
  /**
   * Translations related to confirmation handler
   */
  confirmationHandler: {
    confirmButtonText: string;
    cancelButtonText: string;
    title: string;
    message: string;
  };
  /**
   * Translations related to error handler
   */
  errorHandler: {
    cancelButtonText: string;
    title: string;
  };
  /**
   * Translations related to vacation request
   */
  vacationRequest: {
    startDate: string;
    endDate: string;
    type: string;
    message: string;
    days: string;
    status: string;
    updatedAt: string;
    pending: string;
    approved: string;
    declined: string;
    vacation: string;
    maternityPaternityLeave: string;
    unpaidTimeOff: string;
    sickness: string;
    personalDays: string;
    childSickness: string;
    noMessage: string;
    noStatus: string;
    person: string;
    noPersonFullName: string;
  };
  /**
   * Translations related to vacation requests errors
   */
  vacationRequestError: {
    fetchRequestError: string;
    fetchStatusError: string;
    createRequestError: string;
    createStatusError: string;
    deleteRequestError: string;
    deleteStatusError: string;
    updateRequestError: string;
    updateStatusError: string;
    noVacationRequestsFound: string;
    nameNotFound: string;
  };
  /**
   * Translations related to sprint requests errors
   */
  sprintRequestError: {
    fetchError: string;
    fetchTimeEntriesError: string;
    fetchAllocationError: string;
    fetchTasksError: string;
    fetchTaskIdError: string;
  };
  /**
   * Translations related to form
   */
  form: {
    submit: string;
    update: string;
  };
  /**
   * Translation related to table toolbar
   */
  tableToolbar: {
    delete: string;
    myRequests: string;
    createRequests: string;
    editRequests: string;
    edit: string;
    cancel: string;
    create: string;
    manageRequests: string;
    future: string;
    past: string;
  };
  /**
   * Translations related to data grid
   */
  dataGrid: {
    noRows: string;
  };
  /**
   * Translations related to vacations card
   */
  vacationsCard: {
    vacations: string;
    noUpcomingVacations: string;
    noPendingVacations: string;
    upComingVacations: string;
    pendingVacations: string;
    nextUpcomingVacation: string;
    vacationType: string;
    applicant: string;
    timeOfVacation: string;
    status: string;
    unspentVacations: string;
    spentVacations: string;
  };
  /**
   * Translation related to person select dropdown
   */
  personSelectDropdown: {
    label: string;
  };
  /**
   * Translations related to toolbar update status button
   */
  toolbarUpdateStatusButton: {
    approve: string;
    decline: string;
  };
  /**
   * Translation related to admin route access
   */
  adminRouteAccess: {
    notAdmin: string;
    noAccess: string;
  };
  /**
   * Translation related to vacations screen
   */
  vacationsScreen: {
    back: string;
  };
  /**
   * Translation related to view all screen
   */
  viewAll: {
    startDate: string;
    balance: string;
  };
  /**
   * Translations related to sync dialog
   */
  syncDialog: {
    cancel: string;
    sync: string;
    title: string;
    label: string;
  };
  /**
   * Translations related to sync button
   */
  syncButton: {
    success: string;
    sync: string;
    error: string;
  };
  /**
   * Translations related to employee's selection
   */
  employeeSelect: {
    employeeSelectlabel: string;
  };
  /**
   * Translations related to Questinnaire card
   */
  questionnaireCard: {
    questionnairesBuilder: string;
    questionnaires: string;
    progressBar: string;
  };
  /**
   * Translations related to Questinnaire Screen
   */
  questionnaireScreen: {
    currentQuestionnaires: string;
    buildNewQuestionnaire: string;
    back: string;
  };
  /**
   * Translations related to New Questionnaire Builder
   */
  newQuestionnaireBuilder: {
    makeNewQuestionnaire: string;
    title: string;
    insertTitle: string;
    saveButton: string;
    preview: string;
    is: string;
    removeFromPreview: string;
    back: string;
    description: string;
    insertDescription: string;
    countedAnswers: string;
    requiredAnswers: string;
    tooltipEmptyTitle: string;
    tooltipEmptyDescription: string;
    tooltipBothEmpty: string;
  };
  /**
   * Translations related to New Questionnaire Card
    */
  newQuestionnaireCard: {
    newQuestion: string;
    questionLabel: string;
    correctAnswer: string;
    answerLabel: string;
    insertAnswerLabel: string;
    addAnswer: string;
    saveAnswer: string;
  };
  /**
   * Translations related to Questionnaire Table
   */ 
  questionnaireTable: {
    title: string;
    description: string;
    actions: string;
    edit: string;
    delete: string;
    status: string;
    confirmDeleteTitle: string;
    cancel: string;
    confirm: string;
  }; 
  /**
   * Translations related to Questionnaire Interaction Screen
   */
  questionnaireManager: {
    passed: string;
    failed: string;
    goBack: string;
    submit: string;
  };
  /**
   * Translations related to Questionnaire Preview
   */
  questionnairePreview: {
    save: string;
    edit: string;
    remove: string;
    saveAlert: string;
  };
  /**
   * Translations related to Balance Card
   */
  balanceCard: {
    totalFlextimeBalance: string;
    employeeBalances: string;
    viewAllTimeEntries: string;
    balance: string;
    atTheEndOf: string;
    hour: string;
    hours: string;
  };
}

/**
 * Initialized localized strings
 */
const strings: Localized = new LocalizedStrings({ en: en, fi: fi });

export default strings;
