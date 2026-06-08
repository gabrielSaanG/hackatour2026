// Configuração da API
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface ChatRequest {
  question: string;
}

export interface ChatResponse {
  question: string;
  answer: string;
}

/**
 * Envia uma pergunta para o agente RAG e recebe a resposta
 */
export async function sendChatMessage(question: string): Promise<ChatResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Erro ao enviar mensagem");
    }

    const data: ChatResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Erro na API de chat:", error);
    throw error;
  }
}

/**
 * Verifica se a API está disponível
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error("API não está disponível:", error);
    return false;
  }
}
