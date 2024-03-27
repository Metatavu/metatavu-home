import { cleanEnv, num, str, url } from "envalid";

interface Config {
  auth: {
    url: string;
    realm: string;
    clientId: string;
  };
  api: {
    baseUrl: string;
  };
  person: {
    forecastUserIdOverride: number;
  };
}

const env = cleanEnv(import.meta.env, {
  VITE_KEYCLOAK_URL: url(),
  VITE_KEYCLOAK_REALM: str(),
  VITE_KEYCLOAK_CLIENT_ID: str(),
  VITE_API_BASE_URL: url(),
  VITE_FORECAST_USER_ID_OVERRIDE: num({ default: undefined })
});

const config: Config = {
  auth: {
    url: env.VITE_KEYCLOAK_URL,
    realm: env.VITE_KEYCLOAK_REALM,
    clientId: env.VITE_KEYCLOAK_CLIENT_ID
  },
  api: {
    baseUrl: env.VITE_API_BASE_URL
  },
  person: {
    forecastUserIdOverride: env.VITE_FORECAST_USER_ID_OVERRIDE
  }
};

export default config;
