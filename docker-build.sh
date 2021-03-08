#!/usr/bin/env bash

SCRIPT_PATH=$(cd `dirname "$0"`;pwd)
cd "${SCRIPT_PATH}";

# DOCKER_IMAGE_VERSION=$(node --eval="console.log(require('./package.json').version)")
git archive --format=tar --prefix=screenshot-api-server/ -o latest.tar HEAD

docker rmi wuxue107/screenshot-api-server:latest
docker build -t wuxue107/screenshot-api-server:latest .
rm -rf latest.tar
