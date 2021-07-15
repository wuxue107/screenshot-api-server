@echo off

set SCRIPT_PATH=%~dp0
cd %SCRIPT_PATH%
set MOUNT_PATH=./public

if exist "%MOUNT_PATH%" mkdir "%MOUNT_PATH%"

call wslpath.bat "%MOUNT_PATH%" MOUNT_PATH 2>NUL

echo docker run -v "%MOUNT_PATH%:/screenshot-api-server/public" --rm -td -p 3000:3000 --name=screenshot-api-server wuxue107/screenshot-api-server
docker run -v "%MOUNT_PATH%:/screenshot-api-server/public" --rm -td -p 3000:3000 --name=screenshot-api-server wuxue107/screenshot-api-server
