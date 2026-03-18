# Backstage SoftServe

This repository contains a script that allows to create a fresh instance
of Backstage, install all the necessary plugins, and build a docker image that
will be ready to be run locally or deployed to AWS EC2 instance using **docker compose**.

## Local Installation
### How to clone

This repo contains link to the other repo "bash-functions" with some script. Clone it using command.
```bash
  git clone --recurse-submodules git@github.com:<your_backstage-docker_repo>
```

### Prerequisites

In order to make the script work correctly, please make sure that the following
prerequisites are met:

#### 1. MacOS pre-requisites

MacOS comes with Bash 3.2 by default, which is not compatible with the script.
To check your Bash version, run:
```bash
  bash --version
```
The latest version of Bash can be installed using [Homebrew](https://brew.sh/):
```bash
  brew install bash
```
Then add it to your shell, but first check your shell:
```bash
  echo $SHELL
```
For zsh, add the following line to your `~/.zshrc` file:
```bash
  path=(
    /opt/homebrew/bin
    $path[@]
  )
```
For bash, add the following line to your `~/.bash_profile` file:
```bash
  export PATH="/opt/homebrew/bin:$PATH"
```
Restart your shell:
```bash
  exec $SHELL -l
```

#### 2. Ubuntu pre-requisites (tested on Ubuntu 24.04 spined up in Windows WSL)
 The following pre-requisites need to be met before the project build.
 
##### 1. Install Backstage recommended pre-requisites for Debian/Ubuntu (https://backstage.io/docs/getting-started/#prerequisites)
    
    sudo apt install make build-essential wget1
    

 ##### 2. Install Node (see Node dedicated section below)
 ##### 3. Install Yarn 4.4.1 (as of 12/2025 for Backstage 1.46.1) as per https://yarnpkg.com/getting-started/install guide.
 ##### 4. Install Docker (see Docker section below)

#### 3. Docker

Make sure you have Docker installed and running on your machine - for Debian/Ubuntu please use the following guide https://docs.docker.com/engine/install/ubuntu/.

*Podman (https://podman.io/) is a good free alternative in case you don't have a Docker license, it is tested locally and works the same*

#### 4. Node.js

Make sure you have Node.js installed on your machine. The script was tested with Node.js version 22.x.x.
On Debian/Ubuntu the following installation approach is recommended:
   1. Download an official distributive (https://nodejs.org/dist/v22.21.1/node-v22.21.1-linux-x64.tar.xz or https://nodejs.org/dist/v24.12.0/node-v24.12.0-linux-x64.tar.xz)
   2. Unpack the distributive on your local disk
   3. Update your user /home/<your_user_name>/.profile file by adding node bin folder to the system path like
      ```
      PATH=$PATH:<your_path_to_unpacked_node>/bin
      ```
      
**For MacOS - recommended version of Node.js is 20.19.X (tested with 20.19.5)**

#### 5. Yarn

Make sure you have Yarn installed on your machine. The script was tested with Yarn version 4.4.1. 
It is recommended to use the https://yarnpkg.com/getting-started/install guide to do so.

#### 6. Automated Installation

To run the script, execute the following command in your terminal:
```bash
  ./install.sh
```
The script will create a new Backstage instance, install all the necessary plugins, and build a Docker image that is 
ready to be run locally or deployed to AWS EC2 instance using **docker compose**.

#### 7. Run In Docker Compose

There are *docker-compose.yaml* and *docker-compose.local.yaml* files in the root directory of the repository.
Intention is to be able to use different .env files for local and production environments. They use *.env* and *.env.local* 
files respectively.

In order to run the application containers with docker-compose.local.yaml file the following command can be used:
```
docker compose -f docker-compose.local.yaml up
```

To stop and delete the application containers spined up using the command above the following command can be used:
```
docker compose -f docker-compose.local.yaml down
```
#### 8. Prepare .env.local file

Create a `.env.local` file in the root directory of the repository and add the following variables:
```env.local
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_PASSWORD=backstage
POSTGRES_USER=backstage
APP_BASE_URL=http://localhost:7007
BACKEND_BASE_URL=http://localhost:7007
AUTH_ORG_APP_ID=1
AUTH_ORG_CLIENT_ID=clientid
AUTH_ORG_CLIENT_SECRET=clientsecret
AUTH_ORG_PRIVATE_KEY="valid_private_key"
AUTH_GITHUB_ENTERPRISE_INSTANCE_URL=https://github.com
AUTH_ORG_ENTERPRISE_ORGANIZATION=organization

# Replace values with your config
PLUGINS_KEYCLOAKCLIENT_ENV_0_NAME=dev
PLUGINS_KEYCLOAKCLIENT_ENV_0_URL=http://keycloak:8080
PLUGINS_KEYCLOAKCLIENT_ENV_0_REALM=backstage-dev
PLUGINS_KEYCLOAKCLIENT_ENV_0_CLIENTID=admin-cli
PLUGINS_KEYCLOAKCLIENT_ENV_0_USERNAME=devuser
PLUGINS_KEYCLOAKCLIENT_ENV_0_PASSWORD=password

# Replace values with your config
PLUGINS_OAUTHPKCETOKENGENERATOR_ENV_0_NAME=Dev Keycloak
PLUGINS_OAUTHPKCETOKENGENERATOR_ENV_0_AUTHURL=http://localhost:8080/realms/backstage-dev/protocol/openid-connect/auth
PLUGINS_OAUTHPKCETOKENGENERATOR_ENV_0_TOKENURL=http://keycloak:8080/realms/backstage-dev/protocol/openid-connect/token
PLUGINS_OAUTHPKCETOKENGENERATOR_ENV_0_CLIENTID=dev-oauth-client
PLUGINS_OAUTHPKCETOKENGENERATOR_ENV_0_CLIENTSECRET=somesecret
```
To run the Backstage instance in Docker Compose, execute the following command in your terminal:
```bash
  docker compose -f docker-compose.local.yaml up
```

## Setting Up Application in GitHub

Is described in details in [Application Setup in GitHub](docs/github_app.md)

## AWS installation

### Prerequisites

#### 1. AWS Access & configuration 
- You need access to AWS management console 
- Created EC2 instance with at least ~15-20 GB of storage available 
- EC2 instance needs to have Elastic IP address in order to setup properly the configuration, otherwise you need to change URLs on every restart. Current deployment on AWS uses Elastic IP

#### Obtain SSH Access to the VM 
1. Go to AWS management console and login with your credentials
2. Click on your username (top right corner of the screen) and then choose "Security Credentials" from the dropdown
   ![Step 1 of generating access key](docs/Generate_Access_Key_Step_1.png)  



3. Scroll down on the page and find the section "Access Keys" where you need to click the button "Create Access Key"
   ![Step 2 of generating access key](docs/Generate_Access_Key_Step_2.png)  





4. Select "Command Line Interface (CLI)" and agree to terms and conditions
![Step 3 of generating access key](docs/Generate_Access_Key_Step_3.png)



5. Install AWS CLI locally if you haven't --> [AWS page for AWS CLI installation](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)

6. Allow SSH port access for your IP address 
    6.1 Open AWS management console and go to the EC2 instance for which you want to SSH to
    6.2 Click on the instance id to see more details about the instance
    6.3. Go to "Security" tab in the instance details menu 

7. Once your Access Key ID and Secret access key are generated, save them locally for your personal use only

8. Locally, run command `aws configure` and add your Access ID and Secret access key from previous step (see [Configure AWS CLI](https://docs.aws.amazon.com/cli/v1/userguide/cli-authentication-user.html#cli-authentication-user-configure.title))

9. SSH to EC2 instance using the command:
   ```bash 
    aws ec2-instance-connect ssh --instance-id [PUT-EC2-INSTANCE-ID-HERE]
   ```

#### 2. Make sure following tools are installed on the instance: 
- Bash *(tested with version 5.2.15 on current instance)*
- Git *(tested with version 2.40.1 on current instance)*
- Yarn *(tested with version 1.22.22 on current instance)*
- Docker & Docker compose *(tested with version 25.0.5 on current instance)*
- NodeJS *(tested with version 20.18.1 on current instance)* 

### 1. Clone latest repository version 
```bash
  git clone --recurse-submodules git@github.com:<your_backstage-docker_repo>
```

### 2. Configuration you need to change 

#### 2.1 Replace values in the .env file

Create a `.env` file in the root directory of the repository and add the following variables:
```env
APP_BASE_URL=http://[REPLACE-WITH-ELASTIC-IP]:7007
BACKEND_BASE_URL=http://[REPLACE-WITH-ELASTIC-IP]:7007
 
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=backstage
POSTGRES_PASSWORD=backstage
POSTGRES_USER=backstage
 
AUTH_ORG_APP_ID=[REPLACE-WITH-ORG-ID-HERE]
AUTH_ORG_CLIENT_ID=[PUT-CLIENT-ID-HERE]
AUTH_ORG_CLIENT_SECRET=[PUT-CLIENT-SECRET-HERE]
AUTH_ORG_PRIVATE_KEY=[PUT-PRIVATE-KEY-HERE]
AUTH_GITHUB_ENTERPRISE_INSTANCE_URL=https://github.com
AUTH_ORG_ENTERPRISE_ORGANIZATION=[PUT-ENTERPRISE-ORG-HERE]
 
 
PLUGINS_KEYCLOAKCLIENT_ENV_0_NAME=dev
PLUGINS_KEYCLOAKCLIENT_ENV_0_URL=https://keycloak:8443
PLUGINS_KEYCLOAKCLIENT_ENV_0_REALM=backstage-dev
PLUGINS_KEYCLOAKCLIENT_ENV_0_CLIENTID=admin-cli
PLUGINS_KEYCLOAKCLIENT_ENV_0_USERNAME=devuser1
PLUGINS_KEYCLOAKCLIENT_ENV_0_PASSWORD=password
 
PLUGINS_KEYCLOAKCLIENT_ENV_1_NAME=prod
PLUGINS_KEYCLOAKCLIENT_ENV_1_URL=https://keycloak:8443
PLUGINS_KEYCLOAKCLIENT_ENV_1_REALM=backstage-prod
PLUGINS_KEYCLOAKCLIENT_ENV_1_CLIENTID=admin-cli
PLUGINS_KEYCLOAKCLIENT_ENV_1_USERNAME=produser1
PLUGINS_KEYCLOAKCLIENT_ENV_1_PASSWORD=password
 
PLUGINS_OAUTHPKCETOKENGENERATOR_ENV_0_NAME=Keycloak Dev Realm
PLUGINS_OAUTHPKCETOKENGENERATOR_ENV_0_AUTHURL=https://[REPLACE-WITH-ELASTIC-IP]::8443/realms/backstage-dev/protocol/openid-connect/auth
PLUGINS_OAUTHPKCETOKENGENERATOR_ENV_0_TOKENURL=https://keycloak:8443/realms/backstage-dev/protocol/openid-connect/token
PLUGINS_OAUTHPKCETOKENGENERATOR_ENV_0_CLIENTID=dev-oauth-client
PLUGINS_OAUTHPKCETOKENGENERATOR_ENV_0_CLIENTSECRET=[PUT-CLIENT-SECRET-HERE]
 
PLUGINS_OAUTHPKCETOKENGENERATOR_ENV_1_NAME=Keycloak Prod Realm
PLUGINS_OAUTHPKCETOKENGENERATOR_ENV_1_AUTHURL=https://[REPLACE-WITH-ELASTIC-IP]::8443/realms/backstage-prod/protocol/openid-connect/auth
PLUGINS_OAUTHPKCETOKENGENERATOR_ENV_1_TOKENURL=https://keycloak:8443/realms/backstage-prod/protocol/openid-connect/token
PLUGINS_OAUTHPKCETOKENGENERATOR_ENV_1_CLIENTID=prod-oauth-client
PLUGINS_OAUTHPKCETOKENGENERATOR_ENV_1_CLIENTSECRET=[PUT-CLIENT-SECRET-HERE] 
 
NODE_TLS_REJECT_UNAUTHORIZED=0 #Workaround for self-signed TSL certificate for Keycloak 
```

### 2.2 Replace hardcoded URLs in Keycloak data

There are two JSON files in the directory `keycloak/data` which are: `backstage-dev-realm.json` and `backstage-prod-realm.json`. They contain redirect URI information which contains hardcoded host name. In order to properly configure the paths for the application, search by `localhost` and **replace all occurrences with the Elastic IP address of the instance** on which you'll be running the app.  

### 2.3. Generate and place certificates 

When running Keycloak in production mode (as opposed to development mode which is used for local environment), you need to generate TSL certificates which will be used for HTTPS connection. You can use tools like `openssl` to generate certificates necessary for this step.

**It's important to place certificate and key in the `keycloak/data` folder on the server because that's where the application will be looking for them.** 

### 2.4 Security restrictions on the EC2 instance

Make sure to change Inbound rules for the Security group for the EC2 instance so that you allow **only** following rules: 
- open port 22 only for your own IP while working on the deployment and disable it when you're not using it
- open port 7007 only for IP ranges which in SoftServe network (through corporate VPN)
- open port 7007 only for IP ranges which in SoftServe network (through corporate VPN)
- any other inbound communication should not be permitted 
- outbound communication is allowed without restrictions needed at this point

### 3. Run installation script

```bash
  ./install.sh
```

### 4. Start containers
```bash
  docker-compose up
```
### 5. Verify it works properly

1. Open http://[Elastic-IP-Address]:7007 in your browser
2. Make sure you can login with your Github credentials
3. Go to "API Token Generation" and successfully generate a token 

## Backstage upgrade process
In order to upgrade Backstage to next version (https://github.com/backstage/backstage/releases) the following major steps need to be completed:
 1. Stop backstage container (if there is such) and delete previous docker image of backstage
 2. In <backstage_docker_installation_folder>/install.sh search for code line like
    ```
    npx --yes @backstage/create-app@
    ```	
	and place the package version number (https://www.npmjs.com/package/@backstage/create-app/v/0.7.7-next.2?activeTab=versions) which corresponds to the backstage version you want to upgrade to.
 3. To gather information necessary for upgrade, run the following command from an empty folder:
    ```
    npx --yes @backstage/create-app@<create_app_version_you_selected>
	```
 4. Update package.json files for the plugins used by the backstage-docker (oauth-pkce-token-generator-backend-plugin, oauth-pkce-token-generator-plugin, keycloak-client-backend-plugin, keycloak-client-plugin and logger-plugin)
    to be in sync with versions of dependencies used by the backstage after the upgrade. The versions of dependencies can be identified exploring corresponding packages in backstage/node_modules folder created after step #3 above completed.
 5. Copy Dockerfile file backstage folder created after step #3 above completed to backstage-docker and add two project specific lines like 
    ```
    ADD --chown=node:node softserve softserve
	```
	and
	```
    RUN rm -rf /app/softserve
	```
	in the places they are in the version of Dockerfile which resides in backstage-docker of the project repository.
 6. Run install.sh file in backstage-docker folder to build the project
 7. Run 
    ```
    docker compose -f docker-compose.local.yaml up
    ```
	command to build and run application containers and make sure no errors seen the logs.
 8. Check if application is working by hitting localhost:7007 URL in a browser.
 
## Known Issues

See [Known External Issues](docs/known-issues.md) for current limitations and workarounds in dependent systems.

