# React MicroFrontend Template

This repository contains a Backstage template for MicroFrontends with Auth module.

This app was build on top of Vite React+TS module.

## App modules

Template consists of 3 parts:
- Backend (NodeJS server)
- Shell (Hosted MicroFrontends)
- Mfe1 (Remote MicroFrontends)


Backend serves also as a static file service to render both Shell and Mfe1 mfs.
```typescript
app.use("/mfe1", express.static(path.join(__dirname, "../mfe1/dist")));
app.use("/shell", express.static(path.join(__dirname, "../shell/dist")));
```

> If needed, you can add another microfrontend here as well.

## Prerequisites

- Running OAuth2 provider (Keycloak in our case)
- Configured Node.js, NPM, and Vite as the development environment


## Starting and building the app

App can be started as described here: [Startup Guide](docs/startup.md)

Shell app already has a connection to MFE1 microfrontend handled by [Vite Module Federation Plugin](https://www.npmjs.com/package/@originjs/vite-plugin-federation?activeTab=readme)

See: [Vite Plugin Configuration](docs/vite-federation.md)

## Authentication
Authentication is handled by middleware component: [Authentication Guide](docs/auth.md)

## Accessing Secured microservices
Secured access to remote microservices is handled by providing accessToken as an authorization Header with http-proxy-middleware.
See [Accessing Secured Backend Services](docs/proxy-middleware.md) 









