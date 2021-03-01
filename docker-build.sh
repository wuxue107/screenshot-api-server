#!/usr/bin/env bash

script_path=$(cd `dirname "$0"`;pwd)
cd "${script_path}";

git archive --format=tar --prefix=screenshot-api-server/ -o latest.tar HEAD

docker rmi wuxue107/screenshot-api-server:latest
docker build -t wuxue107/screenshot-api-server:latest .
rm -rf latest.tar
