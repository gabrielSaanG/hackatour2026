from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_ollama.llms import OllamaLLM
from langchain_core.prompts import ChatPromptTemplate
from vector import retriever
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Inicializar FastAPI
app = FastAPI(
    title="Agente de Turismo Foz do Iguaçu",
    description="API para interagir com o agente RAG de turismo",
    version="1.0.0"
)

# Configurar CORS para aceitar requisições do frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicializar modelo e prompt
try:
    model = OllamaLLM(model="llama3.2")
    logger.info("Modelo Ollama carregado com sucesso")
except Exception as e:
    logger.error(f"Erro ao carregar modelo Ollama: {e}")
    raise

template = """Você é um expert consultor em responder perguntas
sobre turismos em Foz do Iguaçú. Aqui estão algumas
informações relevantes: {reviews} 
Aqui está a questão para ser respondida: {question}
"""

prompt = ChatPromptTemplate.from_template(template)
chain = prompt | model


# Modelos Pydantic
class ChatRequest(BaseModel):
    question: str


class ChatResponse(BaseModel):
    question: str
    answer: str


# Endpoints
@app.get("/health", tags=["Health"])
async def health_check():
    """Verifica se a API está operacional"""
    return {"status": "ok", "message": "API do agente de turismo está funcionando"}


@app.post("/chat", response_model=ChatResponse, tags=["Chat"])
async def chat(request: ChatRequest):
    """
    Envia uma pergunta para o agente e recebe a resposta.
    
    Args:
        request: ChatRequest contendo a pergunta
        
    Returns:
        ChatResponse contendo a pergunta e a resposta do agente
    """
    try:
        question = request.question.strip()
        
        if not question:
            raise HTTPException(status_code=400, detail="Pergunta não pode estar vazia")
        
        logger.info(f"Pergunta recebida: {question}")
        
        # Recuperar documentos relevantes do vector store
        reviews = retriever.invoke(question)
        logger.info(f"Documentos recuperados: {len(reviews)}")
        
        # Gerar resposta usando a chain
        result = chain.invoke({"reviews": reviews, "question": question})
        
        logger.info(f"Resposta gerada com sucesso")
        
        return ChatResponse(question=question, answer=result)
        
    except Exception as e:
        logger.error(f"Erro ao processar pergunta: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao processar pergunta: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
