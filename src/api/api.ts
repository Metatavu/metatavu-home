import config from "../app/config";
import {
  Configuration,
  type ConfigurationParameters,
  DailyEntriesApi,
  PersonsApi,
  SynchronizeApi,
  VacationRequestsApi,
  VacationRequestStatusApi
} from "../generated/client";
import {
  AllocationsApi,
  Configuration as LambdaConfiguration,
  ProjectsApi,
  SlackAvatarsApi,
  TasksApi,
  TimeEntriesApi,
  UsersApi,
  QuestionnairesApi,
  FlexTimeApi
} from "../generated/homeLambdasClient";

/**
 * Generic type that accepts parameters within the @ConfigurationParameters interface
 */
type ConfigConstructor<T> = new (_params: ConfigurationParameters) => T;

/**
 * Creates a new ConfigConstructor instance with params required to access the API
 *
 * @param ConfigConstructor ConfigConstructor class instance
 * @param basePath API base URL
 * @param accessToken Access token for request
 * @returns ConfigConstructor instance set up with params
 */
const getConfigurationFactory =
  <T>(ConfigConstructor: ConfigConstructor<T>, basePath: string, accessToken?: string) =>
  () => {
    return new ConfigConstructor({
      basePath: basePath,
      accessToken: accessToken
    });
  };

/**
 * API client with request functions to several endpoints
 *
 * @param accessToken Access token required for authentication
 * @returns Configured API request functions
 */
export const getApiClient = (accessToken?: string) => {
  const getConfiguration = getConfigurationFactory(Configuration, config.api.baseUrl, accessToken);

  return {
    dailyEntriesApi: new DailyEntriesApi(getConfiguration()),
    personsApi: new PersonsApi(getConfiguration()),
    synchronizeApi: new SynchronizeApi(getConfiguration()),
    vacationRequestsApi: new VacationRequestsApi(getConfiguration()),
    vacationRequestStatusApi: new VacationRequestStatusApi(getConfiguration())
  };
};

/**
 * Metatavu Home Lambda API client with request functions to several endpoints
 *
 * @param accessToken Access token required for authentication
 * @returns Configured API request functions
 */
export const getLambdasApiClient = (accessToken?: string) => {
  const getConfiguration = getConfigurationFactory(
    LambdaConfiguration,
    config.lambdas.baseUrl,
    accessToken
  );

  return {
    allocationsApi: new AllocationsApi(getConfiguration()),
    projectsApi: new ProjectsApi(getConfiguration()),
    tasksApi: new TasksApi(getConfiguration()),
    timeEntriesApi: new TimeEntriesApi(getConfiguration()),
    slackAvatarsApi: new SlackAvatarsApi(getConfiguration()),
    usersApi: new UsersApi(getConfiguration()),
    questionnairesApi: new QuestionnairesApi(getConfiguration()),
    flexTimeApi: new FlexTimeApi(getConfiguration())
  };
};
