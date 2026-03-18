#!/usr/bin/env bash

if [ -z "$1" ] || [ ! -d "$1" ]; then
    echo "Usage: $0 <path_to_backstage>"
    exit 1
fi

source ./bash-functions/functions.sh

yarn install
yarn tsc
yarn build

yarn pack -o backstage-plugin-oauth-pcke-token-generator.tgz

PACKAGE_NAME=$(basename "$(find . -maxdepth 1 -name "*.tgz" -print -quit)")
if [[ -z "PACKAGE_NAME" ]]; then
  echo "No packed .tgz file found"
  exit 1
fi
cp $PACKAGE_NAME $1/softserve/$PACKAGE_NAME

pushd ${1} > /dev/null || exit
yarn workspace app add @softserve/oauth-pcke-token-generator@file:../../softserve/$PACKAGE_NAME
cd packages/app
yarn install
cd ../..
add_tsx_import ${1}/packages/app/src/App.tsx 'import {TokenGeneratorPage} from "@softserve/oauth-pcke-token-generator";'
add_tsx_route ${1}/packages/app/src/App.tsx '<Route path="/oauth-pkce-token-generator" element={<TokenGeneratorPage/>}/>'
add_tsx_import ${1}/packages/app/src/components/Root/Root.tsx "import VpnKeyIcon from '@material-ui/icons/VpnKey';"
add_tsx_sidebar_item ${1}/packages/app/src/components/Root/Root.tsx '<SidebarItem icon={VpnKeyIcon} to="oauth-pkce-token-generator" text="API Token Generator" />'
popd > /dev/null
