@echo off

set SCRIPT_PATH=%~dp0
cd %SCRIPT_PATH%


git archive --format=tar --worktree-attributes --prefix=screenshot-api-server/ -o latest.tar HEAD

docker rmi wuxue107/screenshot-api-server:latest
docker build -t wuxue107/screenshot-api-server:latest .
del /f latest.tar
