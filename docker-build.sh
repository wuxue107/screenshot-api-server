#!/usr/bin/env bash

SCRIPT_PATH=$(cd `dirname "$0"`;pwd)
cd "${SCRIPT_PATH}";
BASE_IMAGE_VERSION=1.3.0

IMAGE_VERSION=$(env node --eval="console.log(require('./package.json').version)")

## 包含nodejs、wkhtmlpdf、chrome所需依赖、jdk
if [ "$1" == "base" ]; then
    docker rmi wuxue107/screenshot-api-base:latest
    docker  build -f Dockerfile-Base -t wuxue107/screenshot-api-base:${BASE_IMAGE_VERSION} .
fi 

## 包含在base镜像的基础上添加: screenshot-api-server的nodejs依赖和puppeteer chrome
if [ "$1" == "fastbase" ]; then
    git archive --format=tar --worktree-attributes --prefix=screenshot-api-server/ -o latest.tar HEAD
    
    docker rmi wuxue107/screenshot-api-server-fast-base:${BASE_IMAGE_VERSION}
    docker build -f Dockerfile-FastBase -t wuxue107/screenshot-api-server-fast-base:${BASE_IMAGE_VERSION} .
    del /f latest.tar
fi 

## 在fastbase镜像基础上，将当前screenshot-api-server程序包拷贝进去
if [ "$1" == "fast" ]; then
    git archive --format=tar --worktree-attributes --prefix=screenshot-api-server/ -o latest.tar HEAD
    
    docker rmi wuxue107/screenshot-api-server:${IMAGE_VERSION}
    docker build -f Dockerfile-Fast -t wuxue107/screenshot-api-server:${IMAGE_VERSION} .
    del /f latest.tar
    
    docker rmi wuxue107/screenshot-api-server:latest
    docker tag wuxue107/screenshot-api-server:${IMAGE_VERSION} wuxue107/screenshot-api-server:latest
fi 

## 包含在base镜像的基础上, 相当于 fastbase + fast
if [ "$1" == "" ]; then
    git archive --format=tar --worktree-attributes --prefix=screenshot-api-server/ -o latest.tar HEAD
    docker rmi wuxue107/screenshot-api-server:${IMAGE_VERSION}
    docker build -f Dockerfile -t wuxue107/screenshot-api-server:${IMAGE_VERSION} .
    rm -rf latest.tar

    docker rmi wuxue107/screenshot-api-server:latest
    docker tag wuxue107/screenshot-api-server:${IMAGE_VERSION} wuxue107/screenshot-api-server:latest
fi
