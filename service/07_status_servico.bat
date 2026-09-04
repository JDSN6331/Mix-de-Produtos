@echo off
chcp 65001 >nul

echo ============================================
echo   Status do Servico - Mix de Produtos
echo ============================================
echo.

set "SERVICE_DIR=%~dp0"
set "NSSM_EXE=%SERVICE_DIR%nssm\nssm.exe"
set "SERVICE_NAME=MixDeProdutos"

if not exist "%NSSM_EXE%" (
    echo [ERRO] NSSM nao encontrado em: %NSSM_EXE%
    pause
    exit /b 1
)

echo Status atual do servico '%SERVICE_NAME%':
"%NSSM_EXE%" status %SERVICE_NAME%
echo.

set "LOCAL_IP=172.16.253.34"

echo Endereco de acesso: http://%LOCAL_IP%:5175
echo.
pause
