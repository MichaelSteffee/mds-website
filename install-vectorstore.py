#!/usr/bin/env python

import os
from dotenv import load_dotenv

load_dotenv()

from langchain_chroma.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import TokenTextSplitter


def main():
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

    pdf_path = os.path.join(BASE_DIR, "MichaelSteffeeResume.pdf")
    persist_dir = os.path.join(BASE_DIR, "chroma_db")

    print("📄 Loading PDF...")
    loader = PyPDFLoader(pdf_path)
    pages = loader.load()

    print("✂️ Splitting text...")
    splitter = TokenTextSplitter(
        encoding_name="cl100k_base",
        chunk_size=200,
        chunk_overlap=40
    )
    docs = splitter.split_documents(pages)

    print("🧠 Creating embeddings...")
    embedding = OpenAIEmbeddings(model="text-embedding-3-small")

    print("💾 Building vector store (this may take a bit)...")
    vectorstore = Chroma.from_documents(
        documents=docs,
        embedding=embedding,
        persist_directory=persist_dir
    )

    print(f"✅ Done! Vector DB saved to: {persist_dir}")


if __name__ == "__main__":
    main()