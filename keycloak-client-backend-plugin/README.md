# Keycloak Admin Backend Plugin for Backstage

A Backstage backend plugin that allows programmatic management of Keycloak clients across multiple environments (e.g., dev, prod).
This includes endpoints to list environments, create new clients, and retrieve client secrets.

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
    - [Prerequisites](#prerequisites)
    - [Steps](#steps)

---

## Features

- **API Endpoints**
    - **GET /environments**: Retrieves a list of available environments (e.g., dev, qa, prod).
    - **POST /environments/:env/clients**: Creates a new Keycloak client in `:env`.
    - **GET /environments/:env/clients/:uuid/secret**: Retrieves the client secret by UUID in `:env`.

---

## Installation

### Prerequisites

- **Backstage**: Make sure you have a functioning Backstage instance.
- **Frontend Plugin** @softserve/keycloak-client

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
backend.add(import('@softserve/keycloak-client-backend'));
```
4. Add configuration of your environments realms and Client Management credentials to **app-config.yaml** (this approach allows you adding multiple environments via env variables)
```yaml
plugins:
  keycloakClient:
    environments:
      - name: ${PLUGINS_KEYCLOAKCLIENT_ENV_0_NAME}
        url: ${PLUGINS_KEYCLOAKCLIENT_ENV_0_URL}
        realm: ${PLUGINS_KEYCLOAKCLIENT_ENV_0_REALM}
        clientId: ${PLUGINS_KEYCLOAKCLIENT_ENV_0_CLIENTID}
        username: ${PLUGINS_KEYCLOAKCLIENT_ENV_0_USERNAME}
        password: ${PLUGINS_KEYCLOAKCLIENT_ENV_0_PASSWORD}
      - name: ${PLUGINS_KEYCLOAKCLIENT_ENV_1_NAME}
        url: ${PLUGINS_KEYCLOAKCLIENT_ENV_1_URL}
        realm: ${PLUGINS_KEYCLOAKCLIENT_ENV_1_REALM}
        clientId: ${PLUGINS_KEYCLOAKCLIENT_ENV_1_CLIENTID}
        username: ${PLUGINS_KEYCLOAKCLIENT_ENV_1_USERNAME}
        password: ${PLUGINS_KEYCLOAKCLIENT_ENV_1_PASSWORD}
      - ...
```
