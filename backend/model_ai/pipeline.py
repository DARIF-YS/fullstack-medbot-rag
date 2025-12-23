# backend/model_ai/pipeline.py

import os
from dotenv import load_dotenv
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain.chat_models import init_chat_model

# Charger la clé API Google depuis le fichier .env
def load_api_key():
    load_dotenv()
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise RuntimeError("❌ GOOGLE_API_KEY non trouvé dans le fichier .env")
    os.environ["GOOGLE_API_KEY"] = api_key

# Initialiser la base vectorielle Chroma avec HuggingFace embeddings
def init_vector_store():
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2")
    return Chroma(
        collection_name="knowledge_base",
        embedding_function=embeddings,
        persist_directory="./chroma_db",  # chemin où Chroma stocke les vecteurs
    )

# Construire le prompt système à partir des documents retrouvés
def build_system_prompt(docs):
    context = "\n\n".join(d.page_content for d in docs)
    return f"""You are an assistant for question-answering tasks.
    Use the following pieces of retrieved context to answer the question.
    If you don't know the answer, just say that you don't know.
    Provide a complete and detailed answer, using the context as needed.
    Context: {context}:"""

# Fonction pour poser une question au modèle et récupérer réponse + documents
def ask_question(vector_store, llm, question: str):
    docs = vector_store.similarity_search(question, k=3)  # recherche de 3 docs proches
    system_prompt_fmt = build_system_prompt(docs)
    response = llm.invoke([
        SystemMessage(content=system_prompt_fmt),
        HumanMessage(content=question)
    ])
    return response, docs

# Fonction d'initialisation globale appelée depuis main.py
def init_rag():
    load_api_key()
    vector_store = init_vector_store()
    llm = init_chat_model("gemini-2.5-flash", model_provider="google_genai")
    return vector_store, llm
