@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

echo ============================================
echo   Parando Servico - Mix de Produtos
echo ============================================
echo.

net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Este script precisa ser executado como Administrador!
    pause
    exit /b 1
)

set "SERVICE_DIR=%~dp0"
set "NSSM_EXE=%SERVICE_DIR%nssm\nssm.exe"
set "SERVICE_NAME=MixDeProdutos"

if not exist "%NSSM_EXE%" (
    echo [ERRO] NSSM nao encontrado em: %NSSM_EXE%
    pause
    exit /b 1
)

echo [INFO] Parando servico %SERVICE_NAME%...
"%NSSM_EXE%" stop %SERVICE_NAME%

timeout /t 2 >nul
echo.
"%NSSM_EXE%" status %SERVICE_NAME%
echo.
pause
