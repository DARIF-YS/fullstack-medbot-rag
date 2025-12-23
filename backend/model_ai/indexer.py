from uuid import uuid4
from langchain_community.document_loaders import DirectoryLoader, PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma

def main():
    # 1. Modèle d'embedding
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2")

    # 2. Chargement des documents
    loader = DirectoryLoader(
        path="../raw_docs", 
        glob="**/*.pdf", 
        loader_cls=PyPDFLoader,
        use_multithreading=True,
        show_progress=True 
    )
    docs = loader.load()
    print(f"📂 Documents chargés : {len(docs)}")

    # 3. Découpage en chunks
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1500,   # taille d'un chunk
        chunk_overlap=300  # overlap pour continuité
    )
    docs = text_splitter.split_documents(docs)
    print(f"✂️  Chunks créés : {len(docs)}")

    # 4. Stockage vectoriel
    vector_store = Chroma(
        collection_name="knowledge_base",
        embedding_function=embeddings,
        persist_directory="../chroma_db",
    )

    uuids = [str(uuid4()) for _ in range(len(docs))]
    vector_store.add_documents(documents=docs, ids=uuids)

    # 5. Exemple de recherche sémantique
    query = "Comment les véhicules soumis à l’homologation à titre isolé ?"
    results = vector_store.similarity_search(query, k=3)

    print("\n🔍 Résultats de la recherche :")
    for res in results:
        print(f"* {res.page_content[:200]}... [{res.metadata}]")

if __name__ == "__main__":
    main()