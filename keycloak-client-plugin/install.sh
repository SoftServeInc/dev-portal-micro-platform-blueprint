#!/usr/bin/env bash

if [ -z "$1" ] || [ ! -d "$1" ]; then
    echo "Usage: $0 <path_to_backstage>"
    exit 1
fi

source ./bash-functions/functions.sh

yarn install
yarn tsc
yarn build

yarn pack -o backstage-plugin-keycloak-client.tgz

PACKAGE_NAME=$(basename "$(find . -maxdepth 1 -name "*.tgz" -print -quit)")
if [[ -z "PACKAGE_NAME" ]]; then
  echo "No packed .tgz file found"
  exit 1
fi
cp $PACKAGE_NAME $1/softserve/$PACKAGE_NAME

pushd ${1} > /dev/null || exit
yarn workspace app add @softserve/keycloak-client@file:../../softserve/$PACKAGE_NAME
cd packages/app
yarn install
cd ../..
add_tsx_import ${1}/packages/app/src/components/catalog/EntityPage.tsx "import {KeycloakClientCard} from '@softserve/keycloak-client';"
add_tsx_entity_route \
  ${1}/packages/app/src/components/catalog/EntityPage.tsx \
  serviceEntityPage \
  '<EntityLayout.Route path="/keycloak-client" title="OAuth Client"><KeycloakClientCard/></EntityLayout.Route>'

add_tsx_entity_route \
  ${1}/packages/app/src/components/catalog/EntityPage.tsx \
  websiteEntityPage \
  '<EntityLayout.Route path="/keycloak-client" title="OAuth Client"><KeycloakClientCard/></EntityLayout.Route>'
popd > /dev/null
