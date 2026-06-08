from langchain_ollama import OllamaEmbeddings
from langchain_chroma import Chroma
from langchain_core.documents import Document
import os
import pdfplumber

paginas_texto = []

with pdfplumber.open("./files/caderno_turismo_panorama_gastronomia.pdf") as pdf:
    for i, page in enumerate(pdf.pages):
        texto = page.extract_text()
        if texto and texto.strip():
            paginas_texto.append((i + 1, texto.strip()))

embeddings = OllamaEmbeddings(model="mxbai-embed-large")
db_location = "./chroma_langchain_db"
add_documents = not os.path.exists(db_location)

if add_documents:
    documents = []
    ids = []

    for num_pagina, texto in paginas_texto:
        doc = Document(
            page_content=texto,
            metadata={
                "source": "caderno_turismo_panorama_gastronomia.pdf",
                "pagina": num_pagina
            },
        )
        documents.append(doc)
        ids.append(f"pagina_{num_pagina}")
        
    vector_store = Chroma(
        collection_name="gastronomia_parana",
        persist_directory=db_location,
        embedding_function=embeddings
    )
    vector_store.add_documents(documents=documents, ids=ids)
    
    if add_documents:
        vector_store.add_documents(documents=documents, ids=ids)
    
else:
    vector_store = Chroma(
        collection_name="gastronomia_parana",
        persist_directory=db_location,
        embedding_function=embeddings
    )
    print("Banco vetorial carregado.")

retriever = vector_store.as_retriever(search_kwargs={"k": 5})