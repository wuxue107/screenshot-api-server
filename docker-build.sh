#!/usr/bin/env bash

SCRIPT_PATH=$(cd `dirname "$0"`;pwd)
cd "${SCRIPT_PATH}";
BASE_IMAGE_VERSION=1.3.0

IMAGE_VERSION=$(env node --eval="console.log(require('./package.json').version)")

if [ "$1" == "" ]; then
    git archive --format=tar --worktree-attributes --prefix=screenshot-api-server/ -o latest.tar HEAD
    docker rmi wuxue107/screenshot-api-server:${IMAGE_VERSION}
    docker build -f Dockerfile -t wuxue107/screenshot-api-server:${IMAGE_VERSION} .
    rm -rf latest.tar

    docker rmi wuxue107/screenshot-api-server:latest
    docker tag wuxue107/screenshot-api-server:${IMAGE_VERSION} wuxue107/screenshot-api-server:latest
fi


if [ "$1" == "fastbase" ]; then
    git archive --format=tar --worktree-attributes --prefix=screenshot-api-server/ -o latest.tar HEAD
    
    docker rmi wuxue107/screenshot-api-server-fast-base:${BASE_IMAGE_VERSION}
    docker build -f Dockerfile-FastBase -t wuxue107/screenshot-api-server-fast-base:${BASE_IMAGE_VERSION} .
    del /f latest.tar
fi 

if [ "$1" == "fast" ]; then
    git archive --format=tar --worktree-attributes --prefix=screenshot-api-server/ -o latest.tar HEAD
    
    docker rmi wuxue107/screenshot-api-server:${IMAGE_VERSION}
    docker build -f Dockerfile-Fast -t wuxue107/screenshot-api-server:${IMAGE_VERSION} .
    del /f latest.tar
    
    docker rmi wuxue107/screenshot-api-server:latest
    docker tag wuxue107/screenshot-api-server:${IMAGE_VERSION} wuxue107/screenshot-api-server:latest
fi 

if [ "$1" == "full" ]; then
    git archive --format=tar --worktree-attributes --prefix=screenshot-api-server/ -o latest.tar HEAD
    
    docker rmi wuxue107/screenshot-api-server:latest
    docker build -f Dockerfile-Full -t wuxue107/screenshot-api-server:latest .
    del /f latest.tar
fi 

if [ "$1" == "base" ]; then
    docker rmi wuxue107/screenshot-api-base:latest
    docker  build -f Dockerfile-Base -t wuxue107/screenshot-api-base:${BASE_IMAGE_VERSION} .
fi 

    
