from langchain_ollama.llms import OllamaLLM
from langchain_core.prompts import ChatPromptTemplate
from vector import retriever

model = OllamaLLM(model="llama3.2")

template = """Você é um expert consultor em responder perguntas
sobre turismos em Foz do Iguaçú. Aqui estão algumas
informações relevantes: {reviews} 
Aqui está a questão para ser respondida: {question}
"""

prompt = ChatPromptTemplate.from_template(template)
chain = prompt | model


while True:
    print("\n\n--------------------------------")
    question = input("Faça sua pergunta (q para sair): ")
    print("\n\n--------------------------------")

    if question == "q":
        break

    reviews = retriever.invoke(question)

    result = chain.invoke({"reviews": reviews, "question": question})
    print(result)

