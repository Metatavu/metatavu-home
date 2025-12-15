import config from "../app/config";
import {
  ArticleApi,
  type ConfigurationParameters,
  FlexTimeApi,
  Configuration as LambdaConfiguration,
  MemoApi,
  OnCallApi,
  QuestionnairesApi,
  SeveraApi,
  SlackAvatarsApi,
  SoftwareApi,
  TrelloApi,
  UsersApi,
  VacationRequestsApi
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
  <T>(ConfigConstructor: ConfigConstructor<T>, basePath: string, accessToken?: string) =>
  () => {
    return new ConfigConstructor({
      basePath: basePath,
      accessToken: accessToken
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
  const severaApi = new SeveraApi(getConfiguration());
  return {
    resourceAllocationsApi: severaApi,
    phaseApi: severaApi,
    slackAvatarsApi: new SlackAvatarsApi(getConfiguration()),
    softwareApi: new SoftwareApi(getConfiguration()),
    usersApi: new UsersApi(getConfiguration()),
    memoApi: new MemoApi(getConfiguration()),
    TrelloApi: new TrelloApi(getConfiguration()),
    FlexTimeApi: new FlexTimeApi(getConfiguration()),
    workHoursApi: severaApi,
    questionnairesApi: new QuestionnairesApi(getConfiguration()),
    vacationRequestsApi: new VacationRequestsApi(getConfiguration()),
    articleApi: new ArticleApi(getConfiguration()),
    onCallApi: new OnCallApi(getConfiguration()),
    workDaysApi: severaApi
  };
};
