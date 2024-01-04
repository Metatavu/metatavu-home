import config from "../app/config";
import {
  Configuration,
  ConfigurationParameters,
  DailyEntriesApi,
  PersonsApi,
  SynchronizeApi,
  VacationRequestsApi,
  VacationRequestStatusApi
} from "../generated/client";


/**
 * Generic type that accepts parameters within the @ConfigurationParameters interface
 */
// rome-ignore lint/correctness/noUnusedVariables: <explanation>
type  ConfigConstructor<T> = new (_params: ConfigurationParameters) => T;

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
