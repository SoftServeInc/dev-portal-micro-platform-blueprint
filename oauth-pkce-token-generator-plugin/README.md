# OAuth PKCE Token Generator Frontend plugin for Backstage

A Backstage frontend plugin that provides a PKCE-based (Proof Key for Code Exchange) OAuth token generation page.

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
    - [Prerequisites](#prerequisites)
    - [Steps](#steps)

---

## Features

- **Environment Selection**: Dynamically load available environments from the backend.
- **Auth Provider Selection**: For each environment, select a supported provider (e.g. Keycloak, Okta).
- **PKCE Flow**: Redirect to the provider’s login page, then handle the callback to retrieve an access_token.
- **Token Decoding**: Decode the JWT locally and display the header, payload, and signature.
- **Copy-to-Clipboard**: One-click copy of the raw token.

---

## Installation

### Prerequisites

- **Backstage**: Make sure you have a functioning Backstage instance.
- **Backend Plugin** @softserve/oauth-pkce-token-generator-backend

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
3. Add plugin page route to **App.tsx**
```typescript
// file: /packacges/app/src/App.tsx
import {TokenGeneratorPage} from "@softserve/oauth-pcke-token-generator";

// const routes = (...)
<Route path="/oauth-pkce-token-generator" element={<TokenGeneratorPage/>}/>
```
4. Add side menu item to **Root.tsx**
```typescript
// file: /packacges/app/src/components/Root/Root.tsx
import VpnKeyIcon from '@material-ui/icons/VpnKey';

// export const Root = ({ children }: PropsWithChildren<{}>) => (...)
<SidebarItem icon={VpnKeyIcon} to="oauth-pkce-token-generator" text="API Token Generator" />
```
5. Add route path value defined in **App.tsx** to **app-config.yaml**, so backend plugin knows where to redirect after logging in into Auth Provider
```yaml
plugins:
  oauthPkceTokenGenerator:
    frontendRoutePath: 'oauth-pkce-token-generator'
```
