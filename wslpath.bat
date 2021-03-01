@echo off

set FULL_PATH=%~f1
set FILE_PATH=%FULL_PATH:~2%
set FILE_PATH=%FILE_PATH:\=/%
set DEVICE_NAME=%~d1
set DEVICE_NAME=%DEVICE_NAME::=%

for %%i in (a b c d e f g h i j k l m n o p q r s t u v w x y z) do call set DEVICE_NAME=%%DEVICE_NAME:%%i=%%i%%

echo /%DEVICE_NAME%%FILE_PATH%
