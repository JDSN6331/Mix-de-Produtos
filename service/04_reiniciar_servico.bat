@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

echo ============================================
echo   Reiniciando Servico - Mix de Produtos
echo ============================================
echo.

net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Este script precisa ser executado como Administrador!
    pause
    exit /b 1
)

set "APP_DIR=%~dp0.."
set "SERVICE_DIR=%~dp0"
set "NSSM_EXE=%SERVICE_DIR%nssm\nssm.exe"
set "SERVICE_NAME=MixDeProdutos"

echo [INFO] Regenerando dashboard...
cd /d "%APP_DIR%"
python gerar_dashboard.py

echo.
echo [INFO] Reiniciando servico %SERVICE_NAME%...
"%NSSM_EXE%" stop %SERVICE_NAME% >nul 2>&1
timeout /t 1 >nul
"%NSSM_EXE%" start %SERVICE_NAME%

echo.
timeout /t 2 >nul
"%NSSM_EXE%" status %SERVICE_NAME%

set "LOCAL_IP=172.16.253.34"

echo.
echo Acesse em: http://%LOCAL_IP%:5175
echo.
pause
