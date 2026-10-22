@echo off
echo ========================================
echo Iskolar - Scholarship Management System
echo ========================================
echo.
echo Checking if dependencies are installed...
echo.

if not exist node_modules (
    echo Dependencies not found. Installing now...
    echo This may take a few minutes...
    echo.
    call npm install
    echo.
    echo Installation complete!
    echo.
) else (
    echo Dependencies already installed!
    echo.
)

echo Starting development server...
echo.
echo The app will open at: http://localhost:5173
echo Press Ctrl+C to stop the server
echo.

npm run dev
