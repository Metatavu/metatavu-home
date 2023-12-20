import config from "../app/config";
import {
    Configuration,
    ConfigurationParameters,
    DealByIdApi,
    DealsApi,
    InterestApi,
    LeadByIdApi,
    LeadsApi
} from "../generated/homeLambdasClient"

/**
 * Generic type that accepts parameters within the @ConfigurationParameters interface
 */
type ConfigConstructor<T> = new (_params: ConfigurationParameters) => T;

/**
 * Creates a new ConfigConstructor instance with params required to access the Metatavu Home Lambda API
 * 
 * @param ConfigConstructor ConfigConstructor class instance
 * @param basePath Metatavu Home Lambda API base URL
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
* Metatavu Home Lambda API client with request functions to several endpoints 
* 
* @param accessToken Access token required for authentication
* @returns Configured API request functions
*/
export const getLambdaClient  = (accessToken?: string) => {
    const getConfiguration = getConfigurationFactory(Configuration, config.pipedrive.baseUrl, accessToken);

    return {
        dealByIdApi: new DealByIdApi(getConfiguration()),
        dealsApi: new DealsApi(getConfiguration()),
        interestApi: new InterestApi(getConfiguration()),
        leadByIdApi: new LeadByIdApi(getConfiguration()),
        leadsApi: new LeadsApi(getConfiguration())
    };
};