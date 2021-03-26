#!/usr/bin/env bash

SCRIPT_PATH=$(cd `dirname "$0"`;pwd)
cd "${SCRIPT_PATH}";

chmod 755 ./install-font.sh && ./install-font.sh

yarn start
