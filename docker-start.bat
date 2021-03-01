@echo off

set SCRIPT_PATH=%~dp0
cd %SCRIPT_PATH%
set MOUNT_PATH=./public

FOR /F %%i in ('wslpath.bat %MOUNT_PATH%') do ( set MOUNT_PATH=%%i)
:: warning windows 上无法直接挂载文件夹，虚配置 docker file share
echo docker run -v "%MOUNT_PATH%:/screenshot-api-server/public" --rm -td -p 3000:3000 --name=screenshot-api-server wuxue107/screenshot-api-server
docker run -v "%MOUNT_PATH%:/screenshot-api-server/public" --rm -td -p 3000:3000 --name=screenshot-api-server wuxue107/screenshot-api-server
