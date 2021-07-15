#!/usr/bin/env bash

SCRIPT_PATH=$(cd `dirname "$0"`;pwd)
cd "${SCRIPT_PATH}"
MOUNT_PATH="${PWD}/public"

[ -d "${MOUNT_PATH}" ] || mkdir -p "${MOUNT_PATH}"

echo docker run --rm -td -p 3000:3000 -v "${MOUNT_PATH}:/screenshot-api-server/public" --name=screenshot-api-server wuxue107/screenshot-api-server
docker run --rm -td -p 3000:3000 -v "${MOUNT_PATH}:/screenshot-api-server/public" --name=screenshot-api-server wuxue107/screenshot-api-server
