# 🚀 Sistema de API para Agente RAG de Turismo

Sistema completo de chat para interagir com um agente RAG (Retrieval-Augmented Generation) especializado em turismo em Foz do Iguaçu.

## 📋 Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ChatWidget Component                                │  │
│  │  └─ Envia perguntas via API                         │  │
│  │  └─ Exibe respostas do agente                       │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────┬──────────────────────────────────────┘
                        │ HTTP POST /chat
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend (Python/FastAPI)                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  API Endpoints                                       │  │
│  │  ├─ POST /chat      - Processar pergunta            │  │
│  │  └─ GET /health    - Verificar status               │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  RAG Agent                                           │  │
│  │  ├─ Retriever (ChromaDB Vector Store)              │  │
│  │  ├─ LLM (Ollama - llama3.2)                         │  │
│  │  └─ Prompt Template                                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ Pré-requisitos

- **Node.js 18+** (para frontend)
- **Python 3.9+** (para backend)
- **Ollama** instalado e rodando com modelo `llama3.2`
- **Git** (para clonar o repositório)

### Verificar Ollama

```bash
# Verificar se Ollama está rodando
curl http://localhost:11434/api/tags

# Se precisar instalar o modelo
ollama pull llama3.2
ollama pull mxbai-embed-large
```

## 📦 Instalação

### 1. Backend (Python)

```bash
cd src/backend

# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual
# No Windows:
venv\Scripts\activate
# No macOS/Linux:
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt
```

### 2. Frontend (Node.js)

```bash
# Na raiz do projeto
npm install
# ou com bun:
bun install
```

## 🚀 Executar

### Passo 1: Iniciar Backend

```bash
cd src/backend
# Certifique-se que o venv está ativo

# Executar servidor FastAPI
python api.py
```

O servidor estará disponível em: **http://localhost:8000**

Verificar status: **http://localhost:8000/health**

### Passo 2: Iniciar Frontend

Em outro terminal:

```bash
# Na raiz do projeto
npm run dev
# ou com bun:
bun run dev
```

O frontend estará disponível em: **http://localhost:5173**

### Passo 3: Usar o Chat

1. Abra o frontend em http://localhost:5173
2. Clique no botão de chat (ícone de bolha no canto inferior esquerdo)
3. Escreva sua pergunta sobre turismo em Foz do Iguaçu
4. Aguarde a resposta do agente

## 📡 API Endpoints

### GET /health
Verifica se a API está disponível.

```bash
curl http://localhost:8000/health
```

**Response:**
```json
{
  "status": "ok",
  "message": "API do agente de turismo está funcionando"
}
```

### POST /chat
Envia uma pergunta para o agente.

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "Quais são as melhores atrações turísticas em Foz do Iguaçu?"}'
```

**Request Body:**
```json
{
  "question": "string"
}
```

**Response:**
```json
{
  "question": "string",
  "answer": "string"
}
```

## 🔧 Configuração

### Variáveis de Ambiente

Criar arquivo `.env` na raiz do projeto:

```env
# URL do backend (ajuste se necessário)
VITE_API_URL=http://localhost:8000
```

## 🐛 Troubleshooting

### "API não está disponível"
- Verifique se o servidor Python está rodando: `python api.py`
- Verifique se está na porta correta: `http://localhost:8000/health`
- Verifique CORS: Certifique-se que `localhost:5173` está na lista de `allow_origins`

### "Ollama não encontrado"
- Certifique-se que Ollama está instalado e rodando
- Execute: `ollama pull llama3.2` e `ollama pull mxbai-embed-large`

### "Chroma database não encontrado"
- O banco vetorial será criado automaticamente na primeira execução
- Certifique-se que o arquivo PDF existe em `src/backend/files/`

### "Erro de conexão ao PostgreSQL" (se usá-lo futuramente)
- Verifique se o banco de dados está rodando
- Verifique credenciais no `.env`

## 📂 Estrutura de Arquivos

```
hackatour2026/
├── src/
│   ├── backend/
│   │   ├── api.py              # API FastAPI
│   │   ├── main.py             # Script original (CLI)
│   │   ├── vector.py           # Configuração ChromaDB
│   │   ├── requirements.txt    # Dependências Python
│   │   ├── files/              # PDFs para RAG
│   │   └── chroma_langchain_db/# Vector store (auto-criado)
│   ├── services/
│   │   └── chatApi.ts          # Cliente da API (React)
│   ├── components/
│   │   └── ChatWidget.tsx      # Componente de chat
│   └── pages/
│       └── Index.tsx           # Página principal
├── .env                        # Variáveis de ambiente
├── .env.example                # Template do .env
└── package.json                # Dependências Node.js
```

## 🚀 Próximos Passos

- [ ] Adicionar histórico de chat (banco de dados)
- [ ] Implementar persistência de conversas
- [ ] Melhorar tratamento de erros
- [ ] Adicionar logging mais detalhado
- [ ] Implementar rate limiting
- [ ] Adicionar autenticação
- [ ] Deploy em produção

## 📝 Desenvolvimento

### Adicionar nova pergunta de teste

```bash
# Terminal 1: Backend
cd src/backend
python api.py

# Terminal 2: Frontend
npm run dev

# Terminal 3: Testar API
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "O que fazer em Foz do Iguaçu?"}'
```

## 📄 Licença

Este projeto faz parte do Hackatour 2026.

## 👥 Contribuidores

- Gabriel Saang (desenvolvedor)
- Copilot (assistente IA)

---

**Última atualização:** 2026-06-08
