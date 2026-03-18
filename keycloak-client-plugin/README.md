# Keycloak OAuth2 Client Configuration Frontend Plugin for Backstage

A Backstage frontend plugin that allows users to configure and register OAuth2 clients (e.g., PKCE or client credentials) in Keycloak from the UI.

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
    - [Prerequisites](#prerequisites)
    - [Steps](#steps)

---

## Features

- **Environment Selection**: Dynamically fetch available Keycloak environments from the backend.
- **Client Creation**: Create OAuth2 clients with `client_credentials` or `authorization_code` flows.
- **Input Validation**: Built-in validation for required fields such as Client ID and Redirect URIs.
- **Session Storage Support**: Remembers your last input values between sessions.
- **Secret Handling**: Show/hide the client secret securely.
- **Caching**: Uses local storage to cache previously created clients for read-only display.

---

## Installation

### Prerequisites

- **Backstage**: Make sure you have a functioning Backstage instance.
- **Backend Plugin** @softserve/keycloak-client-backend

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
  yarn workspace app add @softserve/keycloak-client@file:$PACKAGE_NAME
```
3. Add plugin card route to **EntityPage.tsx**
```typescript
// file: /packacges/app/src/components/catalog/EntityPage.tsx
import {KeycloakClientCard} from '@softserve/keyclock-client';

// const serviceEntityPage = (...)
<EntityLayout.Route path="/keycloak-client" title="OAuth Client">
    <KeycloakClientCard/> 
</EntityLayout.Route>
```
