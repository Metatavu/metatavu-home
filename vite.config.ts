import { defineConfig, loadEnv, UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import Vault from "node-vault";

/**
 * Fetch secrets from Hashicorp Vault
 * 
 * @param param.token - Vault token
 * @param param.endpoint - Vault endpoint
 * @param param.path - Path to the secrets
 * @returns map of secrets
 */
const fetchSecrets = async ({ token, endpoint, path }) => {
  const vault = Vault({
    apiVersion: 'v1',
    endpoint: endpoint,
    token: token
  });

  const { data } = await vault.read(path);
  return data.data;
};

/**
 * Returns define object for Vite
 * 
 * @param userConfig user configuration
 * @returns define object
 */
const getDefine = async ({ mode }: UserConfig) => {
  const env = loadEnv(mode, process.cwd(), '');
  const { VAULT_TOKEN, VAULT_ENDPOINT, VAULT_PATH } = env;

  const secrets = await fetchSecrets({
    token: VAULT_TOKEN,
    endpoint: VAULT_ENDPOINT,
    path: VAULT_PATH
  });

  return Object.entries(secrets).reduce((acc, [key, value]) => {
    acc[`import.meta.env.${key}`] = JSON.stringify(value);
    return acc;
  }, {});
};

// https://vitejs.dev/config/
export default defineConfig(async (userConfig: UserConfig) => {
  return {
    plugins: [react()],
    server: {
      open: true
    },
    define: await getDefine(userConfig),
    optimizeDeps: {
      include: ["@mui/material/Tooltip"]
    },
    resolve: {
      alias: {
        "src/components": "/src/components",
        "src/atoms": "/src/atoms",
        "src/hooks": "/src/hooks",
        "src/localization": "/src/localization",
        "src/app": "/src/app",
        "src/generated": "/src/generated",
        "src/utils": "/src/utils",
        "src/types": "/src/types",
        "src/theme": "/src/theme",
      }
    }
  };
});