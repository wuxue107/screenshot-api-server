#!/usr/bin/env bash

SCRIPT_PATH=$(cd `dirname "$0"`;pwd)
cd "${SCRIPT_PATH}";

echo #################### START INSTALL FONTS #####################
[ -d ./public/fonts ] && chmod -R 755 ./public/fonts && cp -r ./public/fonts/. /usr/share/fonts/ && fc-cache -rf
fc-list
echo ####################  END INSTALL FONTS  #####################

