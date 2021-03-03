#!/usr/bin/env bash

SCRIPT_PATH=$(cd `dirname "$0"`;pwd)
cd "${SCRIPT_PATH}";

docker stop screenshot-api-server 
docker rm screenshot-api-server 
docker rmi wuxue107/screenshot-api-server 
