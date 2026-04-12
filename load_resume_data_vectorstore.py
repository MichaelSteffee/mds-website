#!/usr/bin/env python

import os
from dotenv import load_dotenv

load_dotenv()

from langchain_chroma.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import TokenTextSplitter
import pandas as pd
from langchain_core.documents import Document

def main():
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

    pdf_path = os.path.join(BASE_DIR, "MichaelSteffeeResume.pdf")
    persist_dir = os.path.join(BASE_DIR, "chroma_db")


    print("📊 Loading Excel files (pandas)...")

    excel_path_1 = os.path.join(BASE_DIR, "MichaelSteffeeJobList.xlsx")
    excel_path_2 = os.path.join(BASE_DIR, "SummaryIndustriesHelped.xlsx")

    df1 = pd.read_excel(excel_path_1)
    df2 = pd.read_excel(excel_path_2)

    def df_to_docs(df, source_name):
        docs = []
        for _, row in df.iterrows():
            content = " | ".join([f"{col}: {row[col]}" for col in df.columns])
            docs.append(Document(page_content=content, metadata={"source": source_name}))
        return docs

    excel_docs_1 = df_to_docs(df1, "summary_excel_1")
    excel_docs_2 = df_to_docs(df2, "summary_excel_2")

    print("📄 Loading PDF...")
    loader = PyPDFLoader(pdf_path)
    pages = loader.load()

    all_docs = pages + excel_docs_1 + excel_docs_2

    print("✂️ Splitting text...")
    splitter = TokenTextSplitter(
        encoding_name="cl100k_base",
        chunk_size=200,
        chunk_overlap=40
    )
 
    docs = splitter.split_documents(all_docs)

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