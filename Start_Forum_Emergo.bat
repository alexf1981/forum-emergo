@echo off
title Forum Emergo Launcher
echo ==========================================
echo   Forum Emergo wordt gestart...
echo   De browser opent automatisch.
echo   Sluit dit venster om te stoppen.
echo ==========================================
echo.

npm run dev

if %errorlevel% neq 0 (
    echo.
    echo ER IS IETS FOUT GEGAAN!
    echo Controleer of Node.js goed is geinstalleerd.
    echo.
    pause
)
