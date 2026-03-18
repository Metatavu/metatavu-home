# Web UI for Metatavu Home SPA

## Running the project
Change to correct node version (found in .nvmrc)
NOTE: If you're using nvm for managing node versions
-`nvm use`

For instructions on setting up automatic node version switching see [here](https://github.com/nvm-sh/nvm#deeper-shell-integration)
-`npm i`

See [Environment variables](#environment-variables)
 variables for setting up hashicorp vault for managing environment variables
After setting up hashicorp vault you can run the project with withhcv npm run dev

## To update spec
Run git submodule update --init

## Linting / formatting
This project uses Biome.js. Please install Biome's VS Code plugin to get automatic linting + formatting on save, suggestions and refactoring. For formatting... (Recommended settings for VS Code to follow later)

## Environment variables
add .env file with VAULT_PATH secret. Contact project team to acquire the HCV credentials and secret value.
Clone repo recursively from github and follow instructions in hcv/withhcv.sh file

## Other requirements
You will need to recursively clone [Backend](https://github.com/Metatavu/home-lambdas), 
and also [Spec](https://github.com/Metatavu/home-lambdas-api-spec)

## Running local development environment
In order to run the local development environment you can use the following command to start the development environment:

```bash
withhcv npm run dev
```
This opens the login screen in your default browser, the application is waiting for keycloak verification running on http://localhost:5173/
Using the google SSO service you should be able to authenticate and then login with your metatavu work account and interact with the application