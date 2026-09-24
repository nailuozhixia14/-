@echo off
setlocal
set "DIR=%~dp0"
set "DIR=%DIR:\=/%"
set "URL=file:///%DIR%index.html"

set "EDGE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if not exist "%EDGE%" set "EDGE=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
set "CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME%" set "CHROME=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"

set "BROWSER="
if exist "%EDGE%" set "BROWSER=%EDGE%"
if not defined BROWSER if exist "%CHROME%" set "BROWSER=%CHROME%"

if not defined BROWSER (
  start "" "%URL%"
  exit /b 0
)

set "PROFILE=%TEMP%\arcana-window-profile"
start "" "%BROWSER%" --app=%URL% --window-size=1300,920 --user-data-dir=%PROFILE% --disable-features=TranslateUI
exit /b 0