@echo off

set SCRIPT_PATH=%~dp0
cd %SCRIPT_PATH%


if "%1" == "" (
    git archive --format=tar --worktree-attributes --prefix=screenshot-api-server/ -o latest.tar HEAD
    
    docker rmi wuxue107/screenshot-api-server:latest
    docker build -f Dockerfile -t wuxue107/screenshot-api-server:latest .
    del /f latest.tar
)

if "%1" == "base" (
    docker rmi wuxue107/screenshot-api-base:latest
    docker  build -f Dockerfile-Base -t wuxue107/screenshot-api-base:1.0.0 .
)

if "%1" == "full" (
    git archive --format=tar --worktree-attributes --prefix=screenshot-api-server/ -o latest.tar HEAD
    
    docker rmi wuxue107/screenshot-api-server:latest
    docker build -f Dockerfile-Full -t wuxue107/screenshot-api-server:latest .
    del /f latest.tar
)
