@echo off
REM Script para iniciar o servidor de API em Windows
REM Este script ativa o ambiente virtual Python e inicia o FastAPI

echo ========================================
echo   Iniciando API do Agente RAG
echo   Servidor: http://localhost:8000
echo ========================================
echo.

cd src\backend

REM Verificar se venv existe
if not exist "venv" (
    echo [INFO] Criando ambiente virtual Python...
    python -m venv venv
    echo [INFO] Ambiente virtual criado!
)

REM Ativar venv
call venv\Scripts\activate.bat

REM Verificar se dependências estão instaladas
pip show fastapi > nul 2>&1
if errorlevel 1 (
    echo [INFO] Instalando dependências...
    pip install -r requirements.txt
    echo [INFO] Dependências instaladas!
)

REM Iniciar API
echo.
echo [INFO] Iniciando servidor FastAPI...
echo [INFO] Para parar, pressione Ctrl+C
echo.
python api.py

pause
