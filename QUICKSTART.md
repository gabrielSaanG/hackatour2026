# 🚀 Quick Start - Sistema de Chat RAG

## ⚡ Início Rápido (Windows)

### 1. Abrir dois terminais

**Terminal 1 - Backend (API)**
```bash
# Na raiz do projeto
start-api.bat
```
✅ O servidor estará em: `http://localhost:8000`

**Terminal 2 - Frontend (React)**
```bash
npm run dev
```
✅ O frontend estará em: `http://localhost:5173`

### 2. Usar o Chat
- Clique no ícone de chat (💬) no canto inferior esquerdo
- Escreva sua pergunta sobre turismo em Foz do Iguaçu
- Aguarde a resposta do agente

---

## 📋 Pré-requisitos

✅ **Node.js 18+** - [Download](https://nodejs.org)
✅ **Python 3.9+** - [Download](https://python.org)
✅ **Ollama** com `llama3.2` - [Download](https://ollama.ai)

### Verificar Ollama

```bash
# Verificar status
curl http://localhost:11434/api/tags

# Instalar modelo (se necessário)
ollama pull llama3.2
ollama pull mxbai-embed-large
```

---

## 🛠️ Setup Manual (se não quiser usar scripts)

### Backend

```bash
cd src/backend

# Criar ambiente Python
python -m venv venv
venv\Scripts\activate  # Windows
# ou: source venv/bin/activate  # macOS/Linux

# Instalar dependências
pip install -r requirements.txt

# Iniciar API
python api.py
```

### Frontend

```bash
# Na raiz do projeto (novo terminal)
npm install
npm run dev
```

---

## 🔍 Verificar Conexão

### API Health Check
```bash
curl http://localhost:8000/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "message": "API do agente de turismo está funcionando"
}
```

### Testar Chat
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "Quais são as melhores atrações de Foz?"}'
```

---

## 🐛 Troubleshooting

| Problema | Solução |
|----------|---------|
| **"API não disponível"** | Verifique se `start-api.bat` está rodando |
| **"Ollama não encontrado"** | Instale Ollama e rode `ollama pull llama3.2` |
| **"Porta 8000 em uso"** | Feche outras aplicações ou mude a porta em `api.py` |
| **"Chroma DB erro"** | Delete a pasta `src/backend/chroma_langchain_db` e reinicie |

---

## 📚 Documentação Completa

Veja [API_SETUP.md](./API_SETUP.md) para mais detalhes sobre:
- Arquitetura do sistema
- Endpoints da API
- Variáveis de ambiente
- Desenvolvimento

---

## ✨ Próximos Passos

- [ ] Adicionar histórico de conversas
- [ ] Persistir chats em banco de dados
- [ ] Implementar autenticação
- [ ] Deploy em produção
- [ ] Rate limiting e cache

---

**Criado com ❤️ para Hackatour 2026**
