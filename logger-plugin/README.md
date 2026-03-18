# Logger Configuration plugin for Backstage

A Backstage frontend plugin that provides ability to change Logger levels in SpringBoot application.

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
    - [Prerequisites](#prerequisites)
    - [Steps](#steps)

---

## Features

- **Server Url configuration**: Fetch Loggers from application server by providing its URL
- **Auth Token**: Enter Auth token to authorize plugin to fetch loggers configuration

---

## Installation

### Prerequisites

- **Backstage**: Make sure you have a functioning Backstage instance.
- **Running SpringBoot application**: Prepare your SpringBoot application with Atuator endpoints enabled
- **CORS**: Allow your service to handle CORS properly by providing BackstageURL as origin

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
  yarn workspace app add @softserve/logger-plugin@file:$PACKAGE_NAME
```
3. Add plugin page route to **App.tsx**
```typescript
// file: /packacges/app/src/App.tsx
import {LoggerPage} from "@softserve/logger-plugin";

// const routes = (...)
<Route path="/logger" element={<LoggerPage />} />
```