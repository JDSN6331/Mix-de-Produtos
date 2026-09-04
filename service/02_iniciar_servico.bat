@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

echo ============================================
echo   Iniciando Servico - Mix de Produtos
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

echo [INFO] Iniciando servico %SERVICE_NAME%...
"%NSSM_EXE%" start %SERVICE_NAME%

echo.
"%NSSM_EXE%" status %SERVICE_NAME%

set "LOCAL_IP=172.16.253.34"

echo.
echo Acesse em: http://%LOCAL_IP%:5175
echo.
pause
