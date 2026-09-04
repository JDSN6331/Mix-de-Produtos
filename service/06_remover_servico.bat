@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

echo ============================================
echo   Removendo Servico - Mix de Produtos
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

echo [INFO] Parando e removendo servico %SERVICE_NAME%...
"%NSSM_EXE%" stop %SERVICE_NAME% >nul 2>&1
"%NSSM_EXE%" remove %SERVICE_NAME% confirm

echo.
echo [OK] Servico removido com sucesso!
echo.
pause
