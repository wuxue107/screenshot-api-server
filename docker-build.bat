@echo off

set SCRIPT_PATH=%~dp0
cd %SCRIPT_PATH%
set BASE_IMAGE_VERSION=1.3.0

node --eval="console.log(require('./package').version);" >version.tmp
set /p IMAGE_VERSION=<version.tmp
del /f version.tmp

if "%1" == "" (
    git archive --format=tar --worktree-attributes --prefix=screenshot-api-server/ -o latest.tar HEAD
    
    docker rmi wuxue107/screenshot-api-server:%IMAGE_VERSION%
    docker build -f Dockerfile -t wuxue107/screenshot-api-server:%IMAGE_VERSION% .
    del /f latest.tar
    
    docker rmi wuxue107/screenshot-api-server:latest
    docker tag wuxue107/screenshot-api-server:%IMAGE_VERSION% wuxue107/screenshot-api-server:latest
)

if "%1" == "fastbase" (
    git archive --format=tar --worktree-attributes --prefix=screenshot-api-server/ -o latest.tar HEAD
    
    docker rmi wuxue107/screenshot-api-server-fast-base:%BASE_IMAGE_VERSION%
    docker build -f Dockerfile-FastBase -t wuxue107/screenshot-api-server-fast-base:%BASE_IMAGE_VERSION% .
    del /f latest.tar
)

if "%1" == "fast" (
    git archive --format=tar --worktree-attributes --prefix=screenshot-api-server/ -o latest.tar HEAD
    
    docker rmi wuxue107/screenshot-api-server:%IMAGE_VERSION%
    docker build -f Dockerfile-Fast -t wuxue107/screenshot-api-server:%IMAGE_VERSION% .
    del /f latest.tar
    
    docker rmi wuxue107/screenshot-api-server:latest
    docker tag wuxue107/screenshot-api-server:%IMAGE_VERSION% wuxue107/screenshot-api-server:latest
)

if "%1" == "base" (
    docker rmi wuxue107/screenshot-api-base:latest
    docker  build -f Dockerfile-Base -t wuxue107/screenshot-api-base:%BASE_IMAGE_VERSION% .
)

if "%1" == "full" (
    git archive --format=tar --worktree-attributes --prefix=screenshot-api-server/ -o latest.tar HEAD
    
    docker rmi wuxue107/screenshot-api-server:latest
    docker build -f Dockerfile-Full -t wuxue107/screenshot-api-server:latest .
    del /f latest.tar
)
