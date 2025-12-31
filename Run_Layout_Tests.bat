@echo off
title Forum Emergo Layout Tests
echo ==========================================
echo   Forum Emergo Layout Tests (Playwright)
echo   Dit kan even duren... (headless browser)
echo ==========================================
echo.

call npx playwright test

echo.
echo ==========================================
echo   Klaar! Zie hierboven voor de resultaten.
echo   Type 'npx playwright show-report' om details te zien.
echo ==========================================
pause
