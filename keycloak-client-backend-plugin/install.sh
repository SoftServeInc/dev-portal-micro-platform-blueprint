#!/usr/bin/env bash

if [ -z "$1" ] || [ ! -d "$1" ]; then
    echo "Usage: $0 <path_to_backstage>"
    exit 1
fi

source ./bash-functions/functions.sh

yarn install
yarn tsc
yarn build 

yarn pack -o backstage-plugin-keycloak-client-backend.tgz

PACKAGE_NAME=$(basename "$(find . -maxdepth 1 -name "*.tgz" -print -quit)")
if [[ -z "PACKAGE_NAME" ]]; then
  echo "No packed .tgz file found"
  exit 1
fi
cp $PACKAGE_NAME $1/softserve/$PACKAGE_NAME

pushd ${1} > /dev/null || exit
yarn workspace backend add @softserve/keycloak-client-backend@file:../../softserve/$PACKAGE_NAME
cd packages/backend
yarn install
cd ../..
add_backend_add_after_last ${1}/packages/backend/src/index.ts "backend.add(import('@softserve/keycloak-client-backend'));"
popd > /dev/null
