@echo off

set SCRIPT_PATH=%~dp0
cd %SCRIPT_PATH%

docker rmi wuxue107/screenshot-api-server-base:latest
docker build -t wuxue107/screenshot-api-server-base:latest -f ./DockerfileBase

