@echo off

set SCRIPT_PATH=%~dp0
cd %SCRIPT_PATH%


docker exec -it screenshot-api-server /bin/bash

