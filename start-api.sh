#!/bin/bash

# Script para iniciar o servidor de API em macOS/Linux
# Este script ativa o ambiente virtual Python e inicia o FastAPI

echo "========================================"
echo "   Iniciando API do Agente RAG"
echo "   Servidor: http://localhost:8000"
echo "========================================"
echo ""

cd src/backend

# Verificar se venv existe
if [ ! -d "venv" ]; then
    echo "[INFO] Criando ambiente virtual Python..."
    python3 -m venv venv
    echo "[INFO] Ambiente virtual criado!"
fi

# Ativar venv
source venv/bin/activate

# Verificar se dependências estão instaladas
pip show fastapi > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "[INFO] Instalando dependências..."
    pip install -r requirements.txt
    echo "[INFO] Dependências instaladas!"
fi

# Iniciar API
echo ""
echo "[INFO] Iniciando servidor FastAPI..."
echo "[INFO] Para parar, pressione Ctrl+C"
echo ""
python api.py
