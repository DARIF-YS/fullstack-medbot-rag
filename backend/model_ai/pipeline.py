# backend/model_ai/pipeline.py

import os
from dotenv import load_dotenv
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain.chat_models import init_chat_model

def load_api_key():
    load_dotenv()
    os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY")

def init_vector_store():
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2")
    return Chroma(
        collection_name="base_collection",
        embedding_function=embeddings,
        persist_directory="./chroma_db", 
    )

def build_system_prompt(docs):
    context = "\n\n".join(d.page_content for d in docs)
    return f"""
        You are a medical assistant. Answer questions solely based on the information provided in the "Knowledge" section below.
        - Do NOT use any other knowledge or personal experience.
        - Do NOT mention to the user that you are using provided knowledge.
        - Be concise, clear, and professional.
        - If the answer is not found in the knowledge, say "I don't know".
        - Cite the source if relevant.

        Knowledge:
        {context}
        """
def ask_question(vector_store, llm, question: str):
    docs = vector_store.similarity_search(question, k=4)
    system_prompt_fmt = build_system_prompt(docs)
    response = llm.invoke([
        SystemMessage(content=system_prompt_fmt),
        HumanMessage(content=question)
    ])
    return response, docs

def init_rag():
    load_api_key()
    vector_store = init_vector_store()
    llm = init_chat_model("gemini-2.5-flash", model_provider="google_genai")
    return vector_store, llm
