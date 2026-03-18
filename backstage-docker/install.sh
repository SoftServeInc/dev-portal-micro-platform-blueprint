#!/usr/bin/env bash

BACKSTAGE_NAME="backstage"

# check bash version and exist if it is less than 4
if [ "${BASH_VERSION%%.*}" -lt 4 ]; then
    echo "Bash version 4 or higher is required. Please update your bash version."
    exit 1
fi

export NODE_OPTIONS=--no-node-snapshot

# check if npx is installed
if ! command -v npx &> /dev/null; then
    echo "npx could not be found. Please install Node.js and npm."
    exit 1
fi

# check if yarn is installed
if ! command -v yarn &> /dev/null; then
    echo "yarn could not be found. Please install yarn."
    exit 1
fi

# enable corepack
corepack enable

# Remove the backstage directory if it already exists
if [ -d "./backstage" ]; then
    echo "Removing existing 'backstage' directory..."
    rm -rf ./backstage
fi

echo ${BACKSTAGE_NAME} | npx --yes @backstage/create-app@0.7.7

mkdir -p ${BACKSTAGE_NAME}/softserve

source ./bash-functions/functions.sh

function clone_and_run() {
    local repo_url=$1
    local script_path=$2
    local backstage_path=$(realpath "$3")
    local repo_name=$(basename "$repo_url" .git)

    if [ -d "$repo_name" ]; then
        # If the repository already exists, pull the latest changes
        echo "Repository $repo_name already exists. Pulling latest changes..."
        echo "Will navigate to folder $repo_name"
        cd "$repo_name" || exit
        git pull
    else
        # Clone the repository if it doesn't exist
        echo "Cloning repository $repo_name..."
        git clone "$repo_url"
        cd "$repo_name" || exit
    fi

    git submodule update --init --recursive
    echo "Have finished running git submodule update --init --recursive"

    # run the script
    if [ -f "$script_path" ]; then
        echo "From folder $(pwd) Running $script_path with parameter $backstage_path"
        bash "$script_path" "$backstage_path"
        echo "Have finished running $script_path with parameter $backstage_path"
    else
        echo "Script $script_path not found in $repo_name."
    fi

    # go back to the original directory
    cd ..
}

replace_signinpage_with_providers() {
  local file="$1"

  if [[ -z "$file" ]]; then
    echo "Usage: replace_signinpage_with_providers path/to/file.tsx"
    return 1
  fi

  if [[ ! -f "$file" ]]; then
    echo "❌ File not found: $file"
    return 1
  fi

  # Skip if already configured
  if grep -q "id: 'github-auth-provider'" "$file"; then
    echo "✅ GitHub provider already exists in $file"
    return 0
  fi

  local match='    SignInPage: props => <SignInPage {...props} auto providers={['"'"'guest'"'"']} />,'
  local tmp_file
  tmp_file=$(mktemp)

  while IFS= read -r line; do
    if [[ "$line" == "$match" ]]; then
      cat <<EOF >> "$tmp_file"
    SignInPage: props => (<SignInPage {...props} auto providers={
        [
          {
            id: 'github-auth-provider',
            title: 'GitHub',
            message: 'Sign in using GitHub',
            apiRef: githubAuthApiRef,
          }
        ]
      } />),
EOF
    else
      echo "$line" >> "$tmp_file"
    fi
  done < "$file"

  mv "$tmp_file" "$file"
  echo "✅ SignInPage replaced in $file"
}

add_after_workdir() {
  local dockerfile="$1"
  local copy_statement="$2"

  if [[ -z "$dockerfile" || -z "$copy_statement" ]]; then
    echo "Usage: add_copy_after_workdir Dockerfile \"COPY ...\""
    return 1
  fi

  if [[ ! -f "$dockerfile" ]]; then
    echo "❌ Dockerfile not found: $dockerfile"
    return 1
  fi

  # Check if COPY already exists
  if grep -Fxq "$copy_statement" "$dockerfile"; then
    echo "✅ COPY statement already exists in $dockerfile"
    return 0
  fi

  local tmp_file
  tmp_file=$(mktemp)

  while IFS= read -r line; do
    echo "$line" >> "$tmp_file"
    if [[ "$line" =~ ^WORKDIR[[:space:]] ]]; then
      echo "$copy_statement" >> "$tmp_file"
    fi
  done < "$dockerfile"

  mv "$tmp_file" "$dockerfile"
  echo "✅ COPY added after WORKDIR in $dockerfile"
}

add_before_cmd() {
  local dockerfile="$1"
  local new_line="$2"

  if [[ -z "$dockerfile" || -z "$new_line" ]]; then
    echo "Usage: add_before_cmd Dockerfile \"your line to add\""
    return 1
  fi

  if [[ ! -f "$dockerfile" ]]; then
    echo "❌ Dockerfile not found: $dockerfile"
    return 1
  fi

  # Check if the line already exists
  if grep -Fxq "$new_line" "$dockerfile"; then
    echo "✅ Line already exists in $dockerfile"
    return 0
  fi

  local tmp_file
  tmp_file=$(mktemp)

  while IFS= read -r line; do
    if [[ "$line" =~ ^CMD[[:space:]] ]]; then
      # Insert the new line BEFORE CMD
      echo "$new_line" >> "$tmp_file"
    fi
    echo "$line" >> "$tmp_file"
  done < "$dockerfile"

  mv "$tmp_file" "$dockerfile"
  echo "✅ Inserted line before CMD in $dockerfile"
}

add_techdocs_setup_before_user_node() {
  local dockerfile="$1"

  if [[ -z "$dockerfile" ]]; then
    echo "Usage: add_techdocs_setup_before_user_node path/to/Dockerfile"
    return 1
  fi

  if [[ ! -f "$dockerfile" ]]; then
    echo "❌ Dockerfile not found: $dockerfile"
    return 1
  fi

  # Check if already installed
  if grep -q "mkdocs-techdocs-core" "$dockerfile"; then
    echo "✅ TechDocs setup already present in $dockerfile"
    return 0
  fi

  local tmp_file
  tmp_file=$(mktemp)

  while IFS= read -r line; do
    if [[ "$line" == "# From here on we use the least-privileged \`node\` user to run the backend." ]]; then
      # Insert new block before this line
      cat <<'EOF' >> "$tmp_file"
# Install techdocs plugins
RUN apt-get update && \
    apt-get install -y python3 python3-pip python3-venv && \
    rm -rf /var/lib/apt/lists/*

ENV VIRTUAL_ENV=/opt/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

RUN pip3 install mkdocs-techdocs-core

EOF
    fi
    echo "$line" >> "$tmp_file"
  done < "$dockerfile"

  mv "$tmp_file" "$dockerfile"
  echo "✅ TechDocs setup inserted before USER node in $dockerfile"
}

yarn --cwd $(realpath "${BACKSTAGE_NAME}")/packages/backend add @backstage/plugin-catalog-backend-module-github
echo "✅ Done packages/backend add @backstage/plugin-catalog-backend-module-github"
yarn --cwd $(realpath "${BACKSTAGE_NAME}")/packages/backend add @backstage/plugin-catalog-backend-module-github-org
echo "✅ Done packages/backend add @backstage/plugin-catalog-backend-module-github-org"

add_backend_add_after_last $(realpath "${BACKSTAGE_NAME}")/packages/backend/src/index.ts "backend.add(import('@backstage/plugin-auth-backend-module-github-provider'));"
echo "✅ Done registering @backstage/plugin-auth-backend-module-github-provider"
add_backend_add_after_last $(realpath "${BACKSTAGE_NAME}")/packages/backend/src/index.ts "backend.add(import('@backstage/plugin-catalog-backend-module-github'));"
echo "✅ Done registering @backstage/plugin-catalog-backend-module-github"
add_backend_add_after_last $(realpath "${BACKSTAGE_NAME}")/packages/backend/src/index.ts "backend.add(import('@backstage/plugin-catalog-backend-module-github-org'));"
echo "✅ Done registering @backstage/plugin-catalog-backend-module-github-org"

add_tsx_import $(realpath "${BACKSTAGE_NAME}")/packages/app/src/App.tsx "import { githubAuthApiRef } from '@backstage/core-plugin-api';"
echo "✅ Done registering @backstage/core-plugin-api"

replace_signinpage_with_providers $(realpath "${BACKSTAGE_NAME}")/packages/app/src/App.tsx
echo "✅ Done replace_signinpage_with_providers"

clone_and_run "git@github.com:<your_logger-plugin_repo_url>" "install.sh" "./${BACKSTAGE_NAME}"
echo "✅ Done clone and run install on logger-plugin"
clone_and_run "git@github.com:<your_oauth-pkce-token-generator-backend-plugin_repo_url>" "install.sh" "./${BACKSTAGE_NAME}"
echo "✅ Done clone and run install on oauth-pkce-token-generator-backend-plugin"
clone_and_run "git@github.com:<your_oauth-pkce-token-generator-plugin_repo_url>" "install.sh" "./${BACKSTAGE_NAME}"
echo "✅ Done clone and run install on oauth-pkce-token-generator-plugin"
clone_and_run "git@github.com:<your_keycloak-client-backend-plugin_repo_url>" "install.sh" "./${BACKSTAGE_NAME}"
echo "✅ Done clone and run install on keycloak-client-backend-plugin"
clone_and_run "git@github.com:<your_keycloak-client-plugin_repo_url>" "install.sh" "./${BACKSTAGE_NAME}"
echo "✅ Done clone and run install on keycloak-client-plugin"

rm -rf $(realpath "${BACKSTAGE_NAME}")/examples/*
cp app-config*.yaml $(realpath "${BACKSTAGE_NAME}")/

pushd $(realpath "${BACKSTAGE_NAME}")/packages/backend > /dev/null || exit
add_after_workdir Dockerfile "ADD --chown=node:node softserve softserve"
add_before_cmd Dockerfile "RUN rm -rf /app/softserve"
add_techdocs_setup_before_user_node Dockerfile
popd > /dev/null

pushd $(realpath "${BACKSTAGE_NAME}") > /dev/null || exit
yarn install
echo "✅ Done yarn install"
yarn tsc
echo "✅ Done yarn tsc"
yarn build:backend
echo "✅ Done yarn build:backend"
yarn build:all
echo "✅ Done yarn build:all"
yarn build-image
echo "✅ Done yarn build-image"
popd > /dev/null
