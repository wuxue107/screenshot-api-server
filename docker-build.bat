@echo off

set SCRIPT_PATH=%~dp0
cd %SCRIPT_PATH%


git archive --format=tar --prefix=screenshot-api-server/ -o latest.tar HEAD

del /f .\latest.tar

docker rmi wuxue107/screenshot-api-server:latest
docker build -t wuxue107/screenshot-api-server:latest