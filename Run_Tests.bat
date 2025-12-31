@echo off
title Forum Emergo Unit Tests
echo ==========================================
echo   Forum Emergo Tests worden gestart...
echo   Druk op 'q' om te stoppen.
echo ==========================================
echo.

call npm run test

echo.
echo ==========================================
echo   Tests afgerond (of gestopt).
echo ==========================================
pause
