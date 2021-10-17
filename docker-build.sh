#!/usr/bin/env bash

SCRIPT_PATH=$(cd `dirname "$0"`;pwd)
cd "${SCRIPT_PATH}";

# DOCKER_IMAGE_VERSION=$(node --eval="console.log(require('./package.json').version)")

if [ "$1" == "" ]; then
  git archive --format=tar --worktree-attributes --prefix=screenshot-api-server/ -o latest.tar HEAD
  docker rmi wuxue107/screenshot-api-server:latest
  docker build -f Dockerfile -t wuxue107/screenshot-api-server:latest .
  rm -rf latest.tar
fi

if [ "$1" == "full" ]; then
    git archive --format=tar --worktree-attributes --prefix=screenshot-api-server/ -o latest.tar HEAD
    
    docker rmi wuxue107/screenshot-api-server:latest
    docker build -f Dockerfile-Full -t wuxue107/screenshot-api-server:latest .
    del /f latest.tar
fi 

if [ "$1" == "base" ]; then
    docker rmi wuxue107/screenshot-api-base:latest
    docker  build -f Dockerfile-Base -t wuxue107/screenshot-api-base:latest .
fi 

    
