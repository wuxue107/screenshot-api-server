#!/usr/bin/env bash

SCRIPT_PATH=$(cd `dirname "$0"`;pwd)
cd "${SCRIPT_PATH}";

docker exec -it screenshot-api-server /bin/bash
