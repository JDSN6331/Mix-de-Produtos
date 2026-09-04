@echo off
setlocal
cd /d "%~dp0"
title Mix de Produtos - Dashboard

echo =========================================================
echo   MIX DE PRODUTOS - ATUALIZANDO DASHBOARD
echo =========================================================
echo.
echo Regenerando template do dashboard...

python -X utf8 "%~dp0gerar_dashboard.py"

echo.
set "LOCAL_IP=172.16.253.34"

echo Abrindo o painel no navegador...
echo Endereco: http://%LOCAL_IP%:5175
start "" "http://%LOCAL_IP%:5175"

exit
