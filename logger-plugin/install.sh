#!/usr/bin/env bash

if [ -z "$1" ] || [ ! -d "$1" ]; then
    echo "Usage: $0 <path_to_backstage>"
    exit 1
fi

source ./bash-functions/functions.sh

yarn install
yarn tsc
yarn build
yarn pack -o backstage-plugin-logger.tgz

PACKAGE_NAME=$(basename "$(find . -maxdepth 1 -name "*.tgz" -print -quit)")
if [[ -z "PACKAGE_NAME" ]]; then
  echo "No packed .tgz file found"
  exit 1
fi
cp $PACKAGE_NAME $1/softserve/$PACKAGE_NAME

pushd ${1} > /dev/null || exit
yarn workspace app add @softserve/backstage-plugin-logger@file:../../softserve/$PACKAGE_NAME
cd packages/app
yarn install
cd ../..
add_tsx_import ${1}/packages/app/src/App.tsx "import { LoggerPage } from '@softserve/backstage-plugin-logger';"
add_tsx_route ${1}/packages/app/src/App.tsx '<Route path="/logger" element={<LoggerPage />} />'
add_tsx_import ${1}/packages/app/src/components/Root/Root.tsx "import DescriptionIcon from '@material-ui/icons/Description';"
add_tsx_sidebar_item ${1}/packages/app/src/components/Root/Root.tsx '<SidebarItem icon={DescriptionIcon} to="logger" text="Loggers Configurator" />'
popd > /dev/null
