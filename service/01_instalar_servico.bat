@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

echo ============================================
echo   Instalador do Servico - Mix de Produtos
echo ============================================
echo.

:: Verificar se esta executando como administrador
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Este script precisa ser executado como Administrador!
    echo.
    echo Clique com o botao direito no arquivo e selecione
    echo "Executar como administrador"
    echo.
    pause
    exit /b 1
)

:: Definir variaveis
set "APP_DIR=%~dp0.."
set "SERVICE_DIR=%~dp0"
set "NSSM_DIR=%SERVICE_DIR%nssm"
set "NSSM_EXE=%NSSM_DIR%\nssm.exe"
set "SERVICE_NAME=MixDeProdutos"
set "PYTHON_PATH=python"
set "LOGS_DIR=%SERVICE_DIR%logs"

:: Criar pasta de logs se nao existir
if not exist "%LOGS_DIR%" mkdir "%LOGS_DIR%"

echo [INFO] Diretorio da aplicacao: %APP_DIR%
echo.

:: Verificar se NSSM existe, caso contrario baixar
if not exist "%NSSM_EXE%" (
    echo [INFO] NSSM nao encontrado. Baixando...
    
    if not exist "%NSSM_DIR%" mkdir "%NSSM_DIR%"
    
    :: Baixar NSSM usando PowerShell
    powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://nssm.cc/release/nssm-2.24.zip' -OutFile '%NSSM_DIR%\nssm.zip'}"
    
    if not exist "%NSSM_DIR%\nssm.zip" (
        echo [ERRO] Falha ao baixar NSSM!
        echo Por favor, baixe manualmente de: https://nssm.cc/download
        pause
        exit /b 1
    )
    
    :: Extrair NSSM
    powershell -Command "& {Expand-Archive -Path '%NSSM_DIR%\nssm.zip' -DestinationPath '%NSSM_DIR%\temp' -Force}"
    
    :: Copiar executavel correto (64-bit ou 32-bit)
    if exist "%NSSM_DIR%\temp\nssm-2.24\win64\nssm.exe" (
        copy "%NSSM_DIR%\temp\nssm-2.24\win64\nssm.exe" "%NSSM_EXE%" >nul
    ) else (
        copy "%NSSM_DIR%\temp\nssm-2.24\win32\nssm.exe" "%NSSM_EXE%" >nul
    )
    
    :: Limpar arquivos temporarios
    rmdir /s /q "%NSSM_DIR%\temp" 2>nul
    del "%NSSM_DIR%\nssm.zip" 2>nul
    
    echo [OK] NSSM baixado e extraido com sucesso!
    echo.
)

:: Verificar se o servico ja existe
"%NSSM_EXE%" status %SERVICE_NAME% >nul 2>&1
if %errorlevel% equ 0 (
    echo [AVISO] O servico ja existe. Removendo para reinstalar...
    "%NSSM_EXE%" stop %SERVICE_NAME% >nul 2>&1
    "%NSSM_EXE%" remove %SERVICE_NAME% confirm >nul 2>&1
    timeout /t 2 >nul
)

:: Encontrar o caminho do Python
for /f "tokens=*" %%i in ('where python 2^>nul') do (
    set "PYTHON_PATH=%%i"
    goto :found_python
)
:found_python

echo [INFO] Python encontrado em: %PYTHON_PATH%
echo.

:: Regenerar HTML com dados atualizados
echo [INFO] Regenerando dashboard...
cd /d "%APP_DIR%"
"%PYTHON_PATH%" gerar_dashboard.py

:: Instalar o servico
echo [INFO] Instalando servico Windows (%SERVICE_NAME%)...
"%NSSM_EXE%" install %SERVICE_NAME% "%PYTHON_PATH%"
"%NSSM_EXE%" set %SERVICE_NAME% AppParameters "server.py"
"%NSSM_EXE%" set %SERVICE_NAME% AppDirectory "%APP_DIR%"
"%NSSM_EXE%" set %SERVICE_NAME% DisplayName "Mix de Produtos - Servidor Web"
"%NSSM_EXE%" set %SERVICE_NAME% Description "Servidor Web para o Dashboard Mix de Produtos (Porta 5175)"
"%NSSM_EXE%" set %SERVICE_NAME% Start SERVICE_AUTO_START
"%NSSM_EXE%" set %SERVICE_NAME% AppStdout "%LOGS_DIR%\stdout.log"
"%NSSM_EXE%" set %SERVICE_NAME% AppStderr "%LOGS_DIR%\stderr.log"
"%NSSM_EXE%" set %SERVICE_NAME% AppRotateFiles 1
"%NSSM_EXE%" set %SERVICE_NAME% AppRotateBytes 1048576

echo.
echo [OK] Servico instalado com sucesso!
echo.

:: Iniciar o servico
echo [INFO] Iniciando servico...
"%NSSM_EXE%" start %SERVICE_NAME%

timeout /t 3 >nul

:: Verificar status
"%NSSM_EXE%" status %SERVICE_NAME%

echo.
echo ============================================
echo   Instalacao concluida!
echo ============================================
echo.
echo O servico foi configurado para iniciar automaticamente
echo quando o Windows for iniciado neste notebook.
echo.

set "LOCAL_IP=172.16.253.34"

echo Acesse o Mix de Produtos em:
echo   http://%LOCAL_IP%:5175
echo.
echo Para verificar logs, veja os arquivos em:
echo   %LOGS_DIR%
echo.
pause
