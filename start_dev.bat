@echo off
rem Batch file to start PrintFlow Pro development server

rem Change to the project directory (adjust if you move the folder)
cd /d "%~dp0"

rem Ensure dependencies are installed
if not exist node_modules (
    echo Installing dependencies...
    npm install
)

rem Start the development server
echo Starting development server...
npm run dev

pause
