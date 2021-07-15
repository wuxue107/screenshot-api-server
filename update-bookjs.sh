#!/usr/bin/env bash

SCRIPT_PATH=$(cd `dirname "$0"`;pwd)
cd "${SCRIPT_PATH}";

echo #################### UPDATE BOOKJS-EAZY #####################
wget https://gitee.com/wuxue107/bookjs-eazy/raw/master/dist/static/js/bookjs/latest/bookjs-eazy.min.js -O /screenshot-api-server/static/js/bookjs/latest/bookjs-eazy.min.js

echo ####################  UPDATE BOOKJS-EAZY  #####################

