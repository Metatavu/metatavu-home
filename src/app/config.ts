import { cleanEnv, num, str, url } from "envalid";

interface Config {
  auth: {
    url: string;
    realm: string;
    clientId: string;
  };
  lambdas: {
    baseUrl: string;
  };
  person: {
    forecastUserIdOverride: number;
  };
  user: {
    testUserSeveraId: string;
  };
  project: {
    testProjectSeveraId: string;
  };
  s3: {
    articleBucket: string;
    articleImagesFolder: string;
  };
}

const env = cleanEnv(import.meta.env, {
  VITE_KEYCLOAK_URL: url(),
  VITE_KEYCLOAK_REALM: str(),
  VITE_KEYCLOAK_CLIENT_ID: str(),
  VITE_FORECAST_USER_ID_OVERRIDE: num({ default: undefined }),
  VITE_HOME_LAMBDAS_BASE_URL: url(),
  VITE_SEVERA_TEST_USER_ID: str({ default: undefined }),
  VITE_SEVERA_TEST_PROJECT_ID: str({ default: undefined }),
  VITE_S3_ARTICLE_BUCKET: url(),
  VITE_S3_ARTICLE_IMAGES_FOLDER: str({ default: "" })
});

const config: Config = {
  auth: {
    url: env.VITE_KEYCLOAK_URL,
    realm: env.VITE_KEYCLOAK_REALM,
    clientId: env.VITE_KEYCLOAK_CLIENT_ID
  },
  lambdas: {
    baseUrl: env.VITE_HOME_LAMBDAS_BASE_URL
  },
  person: {
    forecastUserIdOverride: env.VITE_FORECAST_USER_ID_OVERRIDE
  },
  user: {
    testUserSeveraId: env.VITE_SEVERA_TEST_USER_ID
  },
  project: {
    testProjectSeveraId: env.VITE_SEVERA_TEST_PROJECT_ID
  },
  s3: {
    articleBucket: env.VITE_S3_ARTICLE_BUCKET,
    articleImagesFolder: env.VITE_S3_ARTICLE_IMAGES_FOLDER
  }
};

export default config;
