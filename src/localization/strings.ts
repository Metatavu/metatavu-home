import LocalizedStrings, { type LocalizedStringsMethods } from "localized-strings";
import en from "./en.json";
import fi from "./fi.json";

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
    cancel: string;
    save: string;
    back: string;
  };
  /**
   * Translations related to header
   */
  header: {
    hello: string;
    logout: string;
    home: string;
    settings: string;
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
    questionnaireUpdateFailed: string;
    fetchFailedFlextime: string;
    missingEmailOrId: string;
    noSeveraUserId: string;
    noFlextimeData: string;
    noArticleId: string;
    fetchWorkWeekFailed: string;
    fetchFailedSevera: string;
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
    startDate: string;
    deadLine: string;
    actualWorkHours: string;
    filter: string;
    filterType: string;
    project: string;
    user: string;
    searchBy: string;
  };
  /**
   * Translations related to software registry
   */
  softwareRegistry: {
    softwareRegistry: string;
    softwareRegistryAdmin: string;
    applications: string;
    application: string;
    myApplications: string;
    recommendations: string;
    noRecommendations: string;
    recommendationMessage: string;
    allApplications: string;
    addApplication: string;
    added: string;
    tags: string;
    filter: string;
    results: string;
    searchBy: string;
    clearSearch: string;
    description: string;
    review: string;
    remove: string;
    addToMyApps: string;
    editApp: string;
    addSoftware: string;
    confirmDeletion: string;
    deleteSoftwareDescription: string;
    name: string;
    nameRequired: string;
    imageURL: string;
    imageURLRequired: string;
    URLAddress: string;
    URLExample: string;
    ownReview: string;
    recommend: string;
    cancel: string;
    submit: string;
    addedSuccessfully: string;
    showMore: string;
    showLess: string;
    noPending: string;
    newSoftware: string;
    alreadyExists: string;
    delete: string;
    searchPlaceholder: string;
    loading: string;
    errorUnknownUser: string;
    errorCreatingSoftware: string;
    errorFetchingSoftwareToList: string;
  };

  /**
   * Software status related translations
   */
  softwareStatus: {
    all: string;
    pending: string;
    under_review: string;
    accepted: string;
    deprecated: string;
    declined: string;
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
    editMessage: string;
    editDraftMessage: string;
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
    draft: string;
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
    noReview: string;
    reviewedBy: string;
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
    noVacationRequestsStatusFound: string;
    tooManyDaysRequestedUser: string;
    tooManyDaysRequestedAdmin: string;
    failedToLoad: string;
  };

  /**
   * Translations related to sprint requests errors
   */
  sprintRequestError: {
    fetchResourceAllocationsError: string;
    fetchWorkHoursAndTasksError: string;
  };
  /**
   * Translations related to form
   */
  form: {
    submit: string;
    update: string;
    restoreDefault: string;
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
    submitforApproval: string;
    cancel: string;
    create: string;
    manageRequests: string;
    future: string;
    past: string;
    saveAsDraft: string;
    all: string;
    draft: string;
    saveAsDraftTooltip: string;
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
    unspentVacationDays: string;
    vacationDays: string;
    vacationDaysNotFound: string;
    unspentVacationDaysNotFound: string;
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
  vacationsScreen: {};
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
    tooltipBothEmpty: string;
    tooltipEmptyQuestion: string;
    tooltipEmptyAnswers: string;
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
   * Translations related to Questionnaire edit mode
   */
  questionnaireEdit: {
    title: string;
    titleLabel: string;
    descriptionLabel: string;
    question: string;
    deleteQuestion: string;
    passScoreLabel: string;
    passScoreMax: string;
    update: string;
    clearPassedUsers: string;
    snackbarMessageSuccess: string;
    answerOption: string;
    addAnswerOption: string;
  };
  /**
   * Translations related to tags
   */
  questionnaireTags: {
    title: string;
    searchPlaceholder: string;
    allTags: string;
    emptyTagError: string;
    duplicateTagError: string;
    tagTooLongError: string;
    maxTagsError: string;
    addTag: string;
    addTagPlaceholder: string;
    noTags: string;
    moreCount: string;
  };
  questionnaireProgress: {
    title: string;
    progressText: string;
    allCompleted: string;
    loading: string;
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
  /**
   * Translations related to Wiki Documentation service
   */
  wikiDocumentation: {
    cardTitle: string;
    article: string;
    lastUpdated: string;
    created: string;
    lastRead: string;
    pendingArticles: string;
    noPendingArticles: string;
    noArticlesFound: string;
    create: string;
    save: string;
    edit: string;
    approve: string;
    confirm: string;
    searchArticle: string;
    createArticle: string;
    uploadImage: string;
    imagePreview: string;
    labelTitle: string;
    labelPath: string;
    labelTags: string;
    labelImage: string;
    labelDescription: string;
    labelLink: string;
    draft: string;
    allArticles: string;
    approvedArticles: string;
    connectedArticles: string;
  };
  snackbar: {
    articleSubmitted: string;
    articleCreated: string;
    articleUpdated: string;
    articleApproved: string;
    changesSaved: string;
  };
  /**
   * Translation related settings screen
   */
  settingsScreen: {
    saveSettings: string;
    accept: string;
    decline: string;
    consentToDataProcessing: string;
  };
  /**
   * Translations related to if user is not Severa Opt in
   */
  notOptedInDescription: {
    description: string;
  };
  /**
   * Translations for Admin Vacation Management Card
   */
  adminVacationManagement: {
    heading: string;
    title: string;
    description: string;
    buttonLabel: string;
    editTitle: string;
    totalDays: string;
    remainingDays: string;
    selectYear: string;
    currentYear: string;
    vacationFor: string;
  };
  /**
   * Translations for User Search Bar component
   */
  userSearch: {
    placeholder: string;
  };
  /**
   * Translations for User row component
   */
  userRow: {
    day: string;
  };
  /**
   * Translations for User Table component
   */
  userTable: {
    name: string;
    username: string;
    email: string;
    currentYearTotal: string; // Use a placeholder like "Total Days {year}"
    remainingDays: string;
    actions: string;
    noUsersFound: string;
  };
  /**
   * General or pagination
   */
  pagination: {
    ariaLabel: string;
  };
  /**
   * Translations related to Onboarding
   */
  onboarding: {
    prev: string;
    next: string;
    close: string;
    welcomeTitle: string;
    welcomeContent: string;
    balanceTitle: string;
    balanceContent: string;
    sprintTitle: string;
    sprintContent: string;
    vacationsTitle: string;
    vacationsContent: string;
    questionnaireTitle: string;
    questionnaireContent: string;
    softwareTitle: string;
    softwareContent: string;
    wikiTitle: string;
    wikiContent: string;
    doneTitle: string;
    doneContent: string;
  };

  /**
   * Translations related to On Call
   */
  oncall: {
    title: string;
    previousYear: string;
    nextYear: string;
    oncallShifts: string;
    paid: string;
    notPaid: string;
    calendar: string;
    list: string;
    selectView: string;
    noOnCallPerson: string;
    onCallPersonExists: string;
    fetchFailed: string;
    updatePaidStatusForWeek: string;
    person: string;
    paidStatus: string;
    date: string;
    noUsernameOnCall: string;
    errorUpdatingPaidStatus: string;
    noDataForYear: string;
  };

  employeeFlextime: {
    title: string;
    subtitle: string;
    lastUpdated: string;
    totalEmployees: string;
    combinedBalance: string;
    loading: string;
    noDataFound: string;
    employee: string;
    email: string;
    totalFlextimeBalance: string;
    currentMonthBalance: string;
    status: string;
    active: string;
    inactive: string;
    employeeId: string;
    notAvailable: string;
  };
}

/**
 * Initialized localized strings
 */
const strings: Localized = new LocalizedStrings({ en: en, fi: fi });

export default strings;
