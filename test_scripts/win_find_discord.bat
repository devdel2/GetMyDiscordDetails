@echo off
setlocal enabledelayedexpansion

REM Run the 'whoami' command and store the output in a variable
for /f "delims=" %%a in ('whoami') do set "whoamiOutput=%%a"

REM Extract the username using regular expressions
set "regexPattern=[a-zA-Z0-9_]+\\([a-zA-Z0-9_]+)"
for /f "tokens=2 delims=[]" %%b in ('echo !whoamiOutput!^| findstr /r "%regexPattern%"') do set "username=%%b"

echo %username%

endlocal