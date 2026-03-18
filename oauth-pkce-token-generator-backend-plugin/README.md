# OAuth PKCE Token Generator Backend plugin for Backstage

A Backstage backend plugin that provides a PKCE-based (Proof Key for Code Exchange) OAuth token generation endpoints.

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
    - [Prerequisites](#prerequisites)
    - [Steps](#steps)

---

## Features

- **Environment Management Endpoints**
    - **GET /environments**: Retrieves a list of available client environments (e.g., dev, qa, prod).
- **OAuth PKCE Flow Endpoints**
    - **POST /login**: Initiates the PKCE login flow. This endpoint generates the necessary PKCE parameters (code verifier/challenge), stores session data, and redirects the user to the authentication provider's login page.
    - **GET /callback**: Handles the callback from the authentication provider. This endpoint exchanges the authorization code (along with the PKCE code verifier) for an access token, finalizing the login process.

---

## Installation

### Prerequisites

- **Backstage**: Make sure you have a functioning Backstage instance.
- **Frontend Plugin** @softserve/oauth-pkce-token-generator

### Steps

1. Build plugin locally
```shell
    # in plugin folder
  yarn install
  yarn tsc
  yarn build
  yarn pack
  PACKAGE_NAME=$(find "$(pwd)" -maxdepth 1 -type f -name "*.tgz" -print -quit)
```
2. Add plugin to the Backstage
```shell
    # in Backstage folder
  yarn workspace backend add @softserve/keycloak-client-backend@file:$PACKAGE_NAME
```
3. Register backend plugin in **index.ts**
```typescript
// file: /packacges/backend/src/index.ts
backend.add(import('@softserve/oauth-pkce-token-generator-backend'));
```
4. Add configuration of your environments, authentication providers and clients to **app-config.yaml**
```yaml
plugins:
  oauthPkceTokenGenerator:
  frontendRoutePath: 'oauth-pkce-token-generator'
  environments:
    - name: ${PLUGINS_OAUTHPKCETOKENGENERATOR_ENV_0_NAME}
      authUrl: ${PLUGINS_OAUTHPKCETOKENGENERATOR_ENV_0_AUTHURL}
      tokenUrl: ${PLUGINS_OAUTHPKCETOKENGENERATOR_ENV_0_TOKENURL}
      clientId: ${PLUGINS_OAUTHPKCETOKENGENERATOR_ENV_0_CLIENTID}
      clientSecret: ${PLUGINS_OAUTHPKCETOKENGENERATOR_ENV_0_CLIENTSECRET}
    - name: ${PLUGINS_OAUTHPKCETOKENGENERATOR_ENV_1_NAME}
      authUrl: ${PLUGINS_OAUTHPKCETOKENGENERATOR_ENV_1_AUTHURL}
      tokenUrl: ${PLUGINS_OAUTHPKCETOKENGENERATOR_ENV_1_TOKENURL}
      clientId: ${PLUGINS_OAUTHPKCETOKENGENERATOR_ENV_1_CLIENTID}
      clientSecret: ${PLUGINS_OAUTHPKCETOKENGENERATOR_ENV_1_CLIENTSECRET}
```

---

When registering clinent in Ketcloack to be used in this configuration redirect URL needs to be 
backstage_host:7007/api/oauth-pkce-token-generator-backend/callback
