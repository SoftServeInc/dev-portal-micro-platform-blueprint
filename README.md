# Developer Portal Micro-Platform Blueprint

License

## About

This is a blueprint repository for bootstrapping a **[Backstage](https://backstage.io/)**-based developer portal enriched with custom **SoftServe plugins**, **software templates**, and a **Docker Compose** runtime stack. It automates the creation of a Backstage instance, installs all necessary plugins, and builds a production-ready Docker image deployable locally or on **AWS EC2**.

The blueprint provides the following capabilities out of the box:

- **Backstage Developer Portal** with GitHub authentication, catalog ingestion, and TechDocs support.
- **Keycloak Integration** for identity management, OAuth2 client configuration, and PKCE token generation.
- **Custom Backstage Plugins** for Keycloak client management, OAuth PKCE token generation, and Spring Boot logger configuration.
- **Software Templates** (Backstage Scaffolder) for Java Spring Boot microservices, React micro-frontend shells, and React micro-frontend remotes.
- **Docker Compose** stack running PostgreSQL, Keycloak, and Backstage for fully functional local or cloud deployments.
- **Automated Installation** via a single bash script that scaffolds Backstage, installs plugins, and builds the Docker image.

## Repository Structure

```
dev-portal-micro-platform-blueprint/
├── backstage-docker/                  # Backstage scaffolding, Docker Compose, and deployment configs
│   ├── install.sh                     # Main installation script
│   ├── docker-compose.yaml            # Production Docker Compose
│   ├── docker-compose.local.yaml      # Local development Docker Compose
│   ├── app-config.yaml                # Backstage base configuration
│   ├── app-config.production.yaml     # Backstage production configuration
│   ├── Dockerfile                     # Backstage Docker image definition
│   └── postgres/                      # PostgreSQL initialization scripts
├── bash-functions/                    # Shared bash helpers (git submodule)
│   └── functions.sh                   # Functions for patching Backstage source files
├── keycloak-client-plugin/            # Frontend plugin: Keycloak OAuth2 client management
├── keycloak-client-backend-plugin/    # Backend plugin: Keycloak admin REST API
├── oauth-pkce-token-generator-plugin/         # Frontend plugin: PKCE OAuth token generation
├── oauth-pkce-token-generator-backend-plugin/ # Backend plugin: PKCE login/callback endpoints
├── logger-plugin/                     # Frontend plugin: Spring Boot logger level management
├── microservice-spring-boot/          # Backstage template: Java Spring Boot microservice
│   ├── template.yaml
│   └── skeleton/                      # Maven project with OpenAPI codegen, CI, TechDocs
├── web-ui-shell/                      # Backstage template: Micro-frontend host (shell)
│   ├── template.yaml
│   └── skeleton/                      # Express backend + Vite React shell with module federation
├── web-ui-remote/                     # Backstage template: Micro-frontend remote module
│   ├── template.yaml
│   └── skeleton/                      # Vite React remote with OpenAPI client generation
├── README.md
└── LICENSE
```

## Plugins

| Plugin | Type | Description |
|--------|------|-------------|
| **keycloak-client-plugin** | Frontend | UI for configuring and registering OAuth2 clients in Keycloak (client credentials or authorization code flows), with environment selection, input validation, and secret handling. |
| **keycloak-client-backend-plugin** | Backend | REST API for Keycloak admin operations — list environments, create clients, and fetch client secrets. |
| **oauth-pkce-token-generator-plugin** | Frontend | PKCE-based OAuth token generation page — pick environment/provider, complete login redirect, decode JWT, and copy token. |
| **oauth-pkce-token-generator-backend-plugin** | Backend | PKCE login and callback endpoints with environment listing, configured per `app-config.yaml`. |
| **logger-plugin** | Frontend | Interface to view and adjust Spring Boot Actuator logger levels on running services. |

## Software Templates

| Template | Description |
|----------|-------------|
| **microservice-spring-boot** | Scaffolds a **Spring Boot** service with OpenAPI-first code generation, OAuth configuration, GitHub Actions CI, TechDocs, and catalog registration. |
| **web-ui-shell** | Scaffolds a **micro-frontend host** with an Express backend (session management, OAuth2 via Passport, API proxy) and a Vite React shell using module federation. |
| **web-ui-remote** | Scaffolds a **federated remote** Vite React application with OpenAPI Generator (typescript-axios) and CI/catalog sync patterns. |

## Tech Stack

- **[Backstage](https://backstage.io/)** — Developer portal framework (Node.js, TypeScript, React)
- **[Keycloak](https://www.keycloak.org/)** — Identity and access management
- **[PostgreSQL](https://www.postgresql.org/)** — Database for Backstage catalog and Keycloak
- **[Docker](https://www.docker.com/) / [Docker Compose](https://docs.docker.com/compose/)** — Containerized deployment
- **[Spring Boot](https://spring.io/projects/spring-boot)** — Java microservice framework (template)
- **[Vite](https://vitejs.dev/)** — Frontend build tool with module federation support
- **[Yarn 4.4.1](https://yarnpkg.com/)** — Package manager
- **Node.js 22.x** — Runtime environment

## Quickstart

### Prerequisites

Make sure the following tools are installed on your machine:

- **Bash** >= 4.0 (macOS ships with 3.2 — install a newer version via `brew install bash`)
- **Node.js** 22.x ([download](https://nodejs.org/))
- **Yarn** 4.4.1 ([installation guide](https://yarnpkg.com/getting-started/install))
- **Docker** and **Docker Compose** ([Docker installation](https://docs.docker.com/engine/install/))
- **Git** with SSH keys configured for your GitHub account

> **macOS note:** The recommended Node.js version on macOS is **20.19.x**. See the [backstage-docker README](backstage-docker/README.md) for platform-specific details.

> **Ubuntu note (WSL):** Install build essentials first: `sudo apt install make build-essential wget`

### Clone the Repository

```bash
git clone --recurse-submodules git@github.com:<your_org>/dev-portal-micro-platform-blueprint.git
cd dev-portal-micro-platform-blueprint/backstage-docker
```

### Run the Installation

```bash
./install.sh
```

This script will:
1. Create a fresh Backstage instance via `@backstage/create-app`.
2. Install and wire all SoftServe plugins.
3. Copy Backstage configuration files.
4. Build the application and produce a `backstage` Docker image.

### Start the Local Environment

1. Create a `.env-local` file in `backstage-docker/` with the required environment variables (see [Environment Configuration](#environment-configuration) below).
2. Start the stack:

```bash
docker compose -f docker-compose.local.yaml up
```

3. Open [http://localhost:7007](http://localhost:7007) in your browser and log in with your GitHub credentials.

To stop the stack:

```bash
docker compose -f docker-compose.local.yaml down
```

## Environment Configuration

Create a `.env-local` file (for local development) or `.env` file (for production) in the `backstage-docker/` directory. Below is an example for local development:

```env
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_PASSWORD=backstage
POSTGRES_USER=backstage
APP_BASE_URL=http://localhost:7007
BACKEND_BASE_URL=http://localhost:7007

# GitHub App authentication
AUTH_ORG_APP_ID=<your-github-app-id>
AUTH_ORG_CLIENT_ID=<your-client-id>
AUTH_ORG_CLIENT_SECRET=<your-client-secret>
AUTH_ORG_PRIVATE_KEY="<your-private-key>"
AUTH_GITHUB_ENTERPRISE_INSTANCE_URL=https://github.com
AUTH_ORG_ENTERPRISE_ORGANIZATION=<your-organization>

# Keycloak Client Plugin
PLUGINS_KEYCLOAKCLIENT_ENV_0_NAME=dev
PLUGINS_KEYCLOAKCLIENT_ENV_0_URL=http://keycloak:8080
PLUGINS_KEYCLOAKCLIENT_ENV_0_REALM=backstage-dev
PLUGINS_KEYCLOAKCLIENT_ENV_0_CLIENTID=admin-cli
PLUGINS_KEYCLOAKCLIENT_ENV_0_USERNAME=devuser
PLUGINS_KEYCLOAKCLIENT_ENV_0_PASSWORD=<password>

# OAuth PKCE Token Generator Plugin
PLUGINS_OAUTHPKCETOKENGENERATOR_ENV_0_NAME=Dev Keycloak
PLUGINS_OAUTHPKCETOKENGENERATOR_ENV_0_AUTHURL=http://localhost:8080/realms/backstage-dev/protocol/openid-connect/auth
PLUGINS_OAUTHPKCETOKENGENERATOR_ENV_0_TOKENURL=http://keycloak:8080/realms/backstage-dev/protocol/openid-connect/token
PLUGINS_OAUTHPKCETOKENGENERATOR_ENV_0_CLIENTID=dev-oauth-client
PLUGINS_OAUTHPKCETOKENGENERATOR_ENV_0_CLIENTSECRET=<secret>
```

For production (AWS EC2) configuration with TLS-enabled Keycloak and multiple environments, see the [backstage-docker README](backstage-docker/README.md).

## AWS Deployment

The blueprint supports deployment to **AWS EC2** instances using Docker Compose. The production setup includes:

- **Elastic IP** for stable addressing
- **Keycloak in production mode** with TLS certificates on port 8443
- **Multi-environment** Keycloak configuration (dev + prod realms)
- **Security group** rules restricting access to corporate VPN

For detailed AWS deployment instructions, including SSH access setup, environment variable configuration, TLS certificate generation, and security hardening, refer to the [backstage-docker README](backstage-docker/README.md#aws-installation).

## Backstage Upgrade Process

To upgrade Backstage to a newer version:

1. Stop the running Backstage container and remove the existing Docker image.
2. Update the `@backstage/create-app` version in `backstage-docker/install.sh`.
3. Generate a fresh Backstage instance with the new version to identify dependency changes.
4. Update `package.json` files for all SoftServe plugins to match the new Backstage dependency versions.
5. Update the `Dockerfile` with any changes from the new Backstage version (preserving custom `softserve` lines).
6. Run `./install.sh` to rebuild and verify with `docker compose -f docker-compose.local.yaml up`.

See the [backstage-docker README](backstage-docker/README.md#backstage-upgrade-process) for the full step-by-step guide.

## Documentation

Each component has its own documentation:

- **[Backstage Docker Setup](backstage-docker/README.md)** — Installation, configuration, Docker Compose, AWS deployment, and upgrade process.
- **[Keycloak Client Plugin](keycloak-client-plugin/README.md)** — Frontend plugin features and installation.
- **[OAuth PKCE Token Generator Plugin](oauth-pkce-token-generator-plugin/README.md)** — PKCE token generation features and installation.
- **[Logger Plugin](logger-plugin/README.md)** — Logger configuration plugin features and installation.
- **[Java Enterprise Template](microservice-spring-boot/README.md)** — Spring Boot template overview and code generation.
- **[React MicroFrontend Shell Template](web-ui-shell/README.md)** — MFE host template with authentication.
- **[React MicroFrontend Remote Template](web-ui-remote/README.md)** — MFE remote template overview.
- **[GitHub App Setup](backstage-docker/docs/github_app.md)** — Setting up the GitHub App for authentication.

## Contributing

If you want to contribute to the project, please follow these steps:

1. Fork the repository to your GitHub account.
2. Create a new branch with a meaningful name:
   - `feature/<feature-name>` for new features
   - `fix/<bug-description>` for bug fixes
   - `docs/<documentation-topic>` for documentation changes
3. Make your changes and commit them following [Conventional Commits](https://www.conventionalcommits.org/):
   ```
   <type>[optional scope]: short, imperative summary

   [Optional longer body explaining what and why]
   [Optional footer: issues, breaking changes, co-authors]
   ```
   Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `style`, `perf`
4. Push to your branch: `git push origin <branch-name>`
5. Create a Pull Request to the `main` branch.
6. Address review comments and wait for approval.


## License

This project is licensed under the **Apache License 2.0**. See the [LICENSE](LICENSE) file for details.
