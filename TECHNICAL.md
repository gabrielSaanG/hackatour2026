# 📋 Documentação Técnica da Integração

## O que foi criado?

### 1. **Backend - API FastAPI** (`src/backend/api.py`)
- Converte o script CLI em API REST
- Endpoints:
  - `POST /chat` - Processa pergunta com RAG + LLM
  - `GET /health` - Verifica status

### 2. **Frontend - Cliente da API** (`src/services/chatApi.ts`)
- Funcções para comunicação com backend:
  - `sendChatMessage(question)` - Envia pergunta
  - `checkApiHealth()` - Verifica disponibilidade

### 3. **Chat Widget Integrado** (`src/components/ChatWidget.tsx`)
- Conectado com a API
- Estados de loading
- Tratamento de erros
- Status da API em tempo real

### 4. **Variáveis de Ambiente** (`.env`)
```
VITE_API_URL=http://localhost:8000
```

### 5. **Documentação**
- `QUICKSTART.md` - Guia rápido
- `API_SETUP.md` - Documentação completa

### 6. **Scripts de Inicialização**
- `start-api.bat` - Windows
- `start-api.sh` - macOS/Linux

---

## 🔄 Fluxo de Requisição

```
1. Usuário escreve pergunta no ChatWidget
   ↓
2. ChatWidget chama sendChatMessage(question)
   ↓
3. API envia POST /chat para http://localhost:8000
   ↓
4. Backend FastAPI recebe requisição
   ↓
5. Backend invoca RAG:
   - Recupera documentos relevantes (ChromaDB)
   - Envia pergunta + documentos para LLM (Ollama)
   - LLM gera resposta
   ↓
6. API retorna resposta em JSON
   ↓
7. ChatWidget exibe resposta ao usuário
```

---

## 🔌 Endpoints

### POST /chat
**Request:**
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

**Status codes:**
- `200` - Sucesso
- `400` - Pergunta vazia
- `500` - Erro no processamento

---

## 📁 Estrutura de Arquivos Adicionados

```
hackatour2026/
├── src/
│   ├── backend/
│   │   ├── api.py              ✨ NOVO - API FastAPI
│   │   ├── main.py             (CLI original - mantido para referência)
│   │   ├── vector.py           (Existente - sem mudanças)
│   │   └── requirements.txt    ✏️ ATUALIZADO - FastAPI + Uvicorn
│   │
│   ├── services/
│   │   └── chatApi.ts          ✨ NOVO - Cliente API TypeScript
│   │
│   └── components/
│       └── ChatWidget.tsx      ✏️ ATUALIZADO - Integrado com API
│
├── .env                         ✨ NOVO - Configuração Vite
├── .env.example               ✨ NOVO - Template
├── start-api.bat              ✨ NOVO - Script Windows
├── start-api.sh               ✨ NOVO - Script Unix
├── QUICKSTART.md              ✨ NOVO - Guia rápido
└── API_SETUP.md               ✨ NOVO - Documentação completa
```

---

## ⚙️ Dependências Adicionadas

### Backend (Python)
```
fastapi          - Framework web
uvicorn          - Servidor ASGI
python-multipart - Parsing de formulários
```

### Frontend (Node.js)
Nenhuma nova dependência! Usa React + fetch nativo.

---

## 🔐 CORS

A API aceita requisições de:
- `http://localhost:5173` (dev frontend)
- `http://localhost:3000` (alternativo)
- `*` (todos - ajustar em produção!)

Configurado em `src/backend/api.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    ...
)
```

---

## 🚀 Como Usar

### Setup Inicial (uma vez)
```bash
# Backend
cd src/backend
python -m venv venv
venv\Scripts\activate  # ou: source venv/bin/activate
pip install -r requirements.txt

# Frontend (já deve estar feito)
npm install
```

### Executar (todo dia)
```bash
# Terminal 1 - Backend
cd src/backend
venv\Scripts\activate
python api.py

# Terminal 2 - Frontend
npm run dev
```

---

## 🧪 Testes Manuais

### 1. Testar API via curl
```bash
# Health check
curl http://localhost:8000/health

# Chat
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "O que fazer em Foz?"}'
```

### 2. Testar UI
- Abrir http://localhost:5173
- Clicar no ícone de chat
- Escrever pergunta
- Verificar resposta

---

## 📊 Logging

### Backend
- Arquivo: `src/backend/api.py` (linhas 14-16)
- Nível: INFO
- Logs: Perguntas recebidas, documentos recuperados, respostas

```python
logger.info(f"Pergunta recebida: {question}")
logger.info(f"Documentos recuperados: {len(reviews)}")
logger.error(f"Erro ao processar pergunta: {e}")
```

### Frontend
- Console do navegador (F12)
- Erros de conexão, respostas

```javascript
console.error("Erro na API de chat:", error);
```

---

## ✅ Checklist de Verificação

- [ ] Python 3.9+ instalado
- [ ] Node.js 18+ instalado
- [ ] Ollama rodando com llama3.2
- [ ] ChromaDB criado (auto em primeira execução)
- [ ] PDF carregado em `src/backend/files/`
- [ ] Dependências Python instaladas
- [ ] Dependências Node instaladas
- [ ] API rodando em http://localhost:8000
- [ ] Frontend rodando em http://localhost:5173
- [ ] Chat widget carregando
- [ ] Pergunta sendo processada
- [ ] Resposta sendo exibida

---

## 🔮 Próximas Melhorias

1. **Persistência**
   - Guardar histórico em banco de dados
   - Usuários com sessões

2. **Performance**
   - Cache de respostas comuns
   - Rate limiting
   - Async streaming

3. **Segurança**
   - Autenticação JWT
   - Validação de entrada
   - CORS restritivo

4. **UX**
   - Indicador de digitação
   - Timestamp nas mensagens
   - Exportar conversa

5. **Monitoring**
   - Métricas de uso
   - Logs estruturados
   - Alertas de erro

---

**Desenvolvido com Copilot CLI**
