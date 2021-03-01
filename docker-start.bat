@echo off

set SCRIPT_PATH=%~dp0
cd %SCRIPT_PATH%
set MOUNT_PATH=./public

FOR /F %%i in ('wslpath.bat %MOUNT_PATH%') do ( set MOUNT_PATH=%%i)


docker run --rm -td -p 3000:3000 -v "%MOUNT_PATH%:/screenshot-api-server/public" --name=screenshot-api-server wuxue107/screenshot-api-server
