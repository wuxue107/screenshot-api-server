@echo off

set SCRIPT_PATH=%~dp0
cd %SCRIPT_PATH%


docker run --rm -td -p 3000:3000 -v "%SCRIPT_PATH%/public:/screenshot-api-server/public" --name=screenshot-api-server wuxue107/screenshot-api-server

