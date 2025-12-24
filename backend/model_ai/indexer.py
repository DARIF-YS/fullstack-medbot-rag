from uuid import uuid4

from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma


def main():
    # 1. Embeddings (HuggingFace)
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-mpnet-base-v2"
    )

    # 2. Chargement des PDFs
    loader = PyPDFDirectoryLoader("../raw_docs")
    documents = loader.load()
    print(f"Documents chargés : {len(documents)}")

    # 3. Découpage intelligent du texte
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=400,
        chunk_overlap=100,
        length_function=len,
        is_separator_regex=False,
    )

    chunks = text_splitter.split_documents(documents)
    print(f"Chunks créés : {len(chunks)}")

    # 4. Vector Store (Chroma)
    vector_store = Chroma(
        collection_name="base_collection",
        embedding_function=embeddings,
        persist_directory="../chroma_db",
    )

    # 5. Insertion des chunks avec UUID
    ids = [str(uuid4()) for _ in range(len(chunks))]
    vector_store.add_documents(documents=chunks, ids=ids)

    # 6. Test de recherche
    query = "comment répartir les rôles entre les professionnels ?"
    results = vector_store.similarity_search(query, k=2)

    print("\nRésultats de la recherche :")
    for i, res in enumerate(results, 1):
        print(f"\n{i}. {res.page_content[:200]}...")
        print(f"Metadata: {res.metadata}")


if __name__ == "__main__":
    main()
