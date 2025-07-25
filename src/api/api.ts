import config from "../app/config";
import {
  Configuration,
  type ConfigurationParameters,
  DailyEntriesApi,
  PersonsApi,
  SynchronizeApi,
} from "../generated/client";
import {
  FlexTimeApi,
  Configuration as LambdaConfiguration,
  PhasesApi,
  QuestionnairesApi,
  ResourceAllocationsApi,
  SlackAvatarsApi,
  SoftwareApi,
  UsersApi,
  WorkHoursApi,
  VacationRequestsApi,
  ArticleApi,
  OnCallApi
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
 *
 * @returns ConfigConstructor instance set up with params
 */
const getConfigurationFactory =
  <T>(
    ConfigConstructor: ConfigConstructor<T>,
    basePath: string,
    accessToken?: string
  ) =>
  () => {
    return new ConfigConstructor({
      basePath: basePath,
      accessToken: accessToken,
    });
  };

/**
 * Metatavu Home Lambda API client with request functions to several endpoints
 *
 * @param accessToken Access token required for authentication
 *
 * @returns Configured API request functions
 */
export const getLambdasApiClient = (accessToken?: string) => {
  const getConfiguration = getConfigurationFactory(
    LambdaConfiguration,
    config.lambdas.baseUrl,
    accessToken
  );
  return {
    resourceAllocationsApi: new ResourceAllocationsApi(getConfiguration()),
    phaseApi: new PhasesApi(getConfiguration()),
    slackAvatarsApi: new SlackAvatarsApi(getConfiguration()),
    softwareApi: new SoftwareApi(getConfiguration()),
    usersApi: new UsersApi(getConfiguration()),
    flexTimeApi: new FlexTimeApi(getConfiguration()),
    workHoursApi: new WorkHoursApi(getConfiguration()),
    questionnairesApi: new QuestionnairesApi(getConfiguration()),
    vacationRequestsApi: new VacationRequestsApi(getConfiguration()),
    articleApi: new ArticleApi(getConfiguration()),
    onCallApi: new OnCallApi(getConfiguration())
  };
};