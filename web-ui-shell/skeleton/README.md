# React MicroFrontend Sample Project

This repository contains a  MicroFrontends with Auth module project created from Backstage template.

This app was build on top of Vite React+TS module.

## Configuration

The configuration file is designed to set up and manage authentication parameters for OAuth2 or OpenID Connect workflows.
It uses environment variables and hardcoded values to define URLs, client credentials, and callback information.

### `authorizationURL`
- **Value**: `"http://localhost:8080/realms/backstage-dev/protocol/openid-connect/auth"`
- **Description**:
    - The URL used to initiate the authorization process.
    - This is typically the endpoint where the authorization server presents the login page to the user.
    - This URL belongs to the OAuth2 or OpenID Connect server (Keycloak in this example).
    - Note: the realm part of the URL ('backstage-dev' in case of the URL above) will be different for different environments/realms 

### `tokenURL`
- **Value**: `"http://localhost:8080/realms/backstage-dev/protocol/openid-connect/token"`
- **Description**:
    - The endpoint for obtaining access and refresh tokens.
    - After the user authorizes the application, the server exchanges the authorization code for tokens using this URL.
    - Note: the realm part of the URL ('backstage-dev' in case of the URL above) will be different for different environments/realms

### `clientID`
- **Value**: `"my-token-client"`
- **Description**:
    - The unique identifier for the client application registered with the OAuth2 or OpenID Connect provider.
    - This ID is used by the authentication server to recognize the application during authorization and token exchanges.
    - The value should be updated in ./backend/config.js file to real value once IdP client has been created and there is real name for the client

### `clientSecret`
- **Value**: `process.env.CLIENT_SECRET`
- **Description**:
    - A confidential key assigned to the client application for secure communication with the authentication server.
    - This value is stored in an environment variable (`CLIENT_SECRET`) for security purposes, avoiding hardcoding sensitive credentials in the source code.
    - This value should be set (in ./backend/.env file, use .env_sample to create the .env file) to real client secret value for the IdP client created ad 

### `callbackURL`
- **Value**: `"http://localhost:3000/auth/callback"`
- **Description**:
    - The endpoint in the client application where the authentication server redirects the user after successful login and authorization.
    - This URL handles the response, including the authorization code, to continue the authentication workflow.

## Usage

1. **Environment Setup**:
    - Ensure the `CLIENT_SECRET` environment variable is set in a `.env` file or the server environment.
    - Example `./backend/.env` file:
      ```
      CLIENT_SECRET=your-client-secret
      ```
    - Set clientID in './backend/config.js'
      ```
      ...
      clientID:"your-client-id"
      ...
      ```

## Building the App

> Before building the app, please make sure you have installed Node, NPM

#### Building Hosted (Shell) MicroFrontend
1. Navigate to the `shell` folder and execute:
   ```sh
   npm install
   npm run build
   ```
   or 
   ```sh
   yarn install
   yarn run build
   ```
2. Verify that the `dist` folder was created.
3. **Note:** You can run this app as a standalone application without a backend by executing:
   ```sh
   npm run dev
   ```
   or
   ```sh
   yarn run dev
   ```
#### Building the Remote App (MFE1)
1. Navigate to the `mfe1` folder and execute:
   ```sh
   npm install
   npm run build
   ```
   or
   ```sh
   yarn install
   yarn run build
   ```

2. Verify that the `dist` folder was created.
3. **Note:** You can run this app as a standalone application without a backend by executing:
   ```sh
   npm run dev
   ```
   or
   ```sh
   yarn run dev
   ```

### Building and Running the Backend
1. Navigate to the `backend` folder and to build and run the service, execute:
   ```sh
   npm install
   npm start
   ```
  or

 ```sh
   yarn install
   yarn start
   ```

2. If everything is set up correctly, you should see a link to your running host, e.g.,
   ```
   http://localhost:3000


## Accessing the app
Go to provided url from Step 2 in Running the backend:
  ```
   http://localhost:3000
```

If not authorized, this will open your's Oauth2 provider authorization screen.
Once authorized, you will be redirected to
  ```
   http://localhost:3000
```

NOTE: The most of the controls on the shell MF's home screen are relying on a REST service spined-up outside of this project.
That service is referred from ./shell/App.tsx file. Please make sure you have such service running and URLs updated appropriately before testing the shell MF.
The project created from the 'SoftServe Java Spring Boot Microservice Template' (see https://github.com/<your_microservice-spring-boot_repo>) can be used to spin-up such a REST service.

To access Shell directly MFe:
  ```
   http://localhost:3000/shell
```
To access directly  Mfe1 MF:
  ```
   http://localhost:3000/mfe1
```
