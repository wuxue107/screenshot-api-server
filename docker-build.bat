@echo off

set SCRIPT_PATH=%~dp0
cd %SCRIPT_PATH%


git archive --format=tar --prefix=screenshot-api-server/ -o latest.tar HEAD

del /f .\latest.tar
