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
    id: number;
  };
  pipedrive:{
    baseUrl: string;
  }
}

const env = cleanEnv(import.meta.env, {
  VITE_KEYCLOAK_URL: url(),
  VITE_KEYCLOAK_REALM: str(),
  VITE_KEYCLOAK_CLIENT_ID: str(),
  VITE_API_BASE_URL: url(),
  VITE_PERSON_ID: num({ default: undefined }),
  VITE_PIPEDRIVE_URL: url()

});

const config: Config = {
  auth: {
    url: env.VITE_KEYCLOAK_URL,
    realm: env.VITE_KEYCLOAK_REALM,
    clientId: env.VITE_KEYCLOAK_CLIENT_ID
  },
  api: {
    baseUrl: env.VITE_API_BASE_URL,
  },
  person: {
    id: env.VITE_PERSON_ID
  },
  pipedrive:{
    baseUrl: env.VITE_PIPEDRIVE_URL
  }
};

export default config;
