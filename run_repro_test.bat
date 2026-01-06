@echo off
echo Running Registration Reproduction Test...
echo.
call npx vitest run src/auth_flow.test.jsx
echo.
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Test passed! The fix is working.
) else (
    echo [FAILURE] Test failed!
)
echo.
pause
