@echo off
setlocal

REM Hook post-commit para Windows (ejecución fuera de opencode)
REM Entry point único: invoca script PowerShell robusto.

for /f "delims=" %%i in ('git rev-parse --show-toplevel 2^>nul') do set REPO_ROOT=%%i
if "%REPO_ROOT%"=="" exit /b 0

where pwsh >nul 2>nul
if errorlevel 1 exit /b 0

pwsh -NoProfile -ExecutionPolicy Bypass -File "%REPO_ROOT%\.opencode\hoocks\post-commit.ps1" -RepoRoot "%REPO_ROOT%"

exit /b 0
