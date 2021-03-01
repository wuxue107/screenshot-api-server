@echo off

set SCRIPT_PATH=%~dp0
cd %SCRIPT_PATH%

docker stop screenshot-api-server && docker rm screenshot-api-server && docker rmi wuxue107/screenshot-api-server 
