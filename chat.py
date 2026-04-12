#!/usr/bin/env python
import os
from datetime import datetime

from flask import current_app

from dotenv import load_dotenv
load_dotenv()

# Remove for new structure in load-resume-data.py ##########################
# from langchain_community.document_loaders import PyPDFLoader
# from langchain_community.document_loaders import UnstructuredExcelLoader

# from langchain_text_splitters import TokenTextSplitter
from load_resume_data_vectorstore import main as build_vectorstore

from langchain_core.output_parsers.string import StrOutputParser
from langchain_core.messages import SystemMessage
from langchain_core.prompts import HumanMessagePromptTemplate, ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough

from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_chroma.vectorstores import Chroma

import logging
from logging.handlers import RotatingFileHandler

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
log_path = os.path.join(BASE_DIR, "logs", "flask_app.log")

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Prevent duplicate handlers if script runs multiple times
if not logger.handlers:
    handler = RotatingFileHandler(
        log_path,
        maxBytes=100000,
        backupCount=3
    )

    formatter = logging.Formatter(
        "%(asctime)s [%(levelname)s] [%(name)s] %(message)s"
    )

    handler.setFormatter(formatter)
    logger.addHandler(handler)

# Example usage
logger.info("This is chat.py starting")


# 🔒 GLOBAL CACHE
chain = None


def build_chain():
    global chain

    if chain is not None:
        return chain

# Remove for new structure in load-resume-data.py ##########################
#    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
#    pdf_path = os.path.join(BASE_DIR, "MichaelSteffeeResume.pdf")

    chat = ChatOpenAI(
        model_name='gpt-4',
        seed=365,
        temperature=0,
        max_tokens=200
    )

# Remove for new structure in load-resume-data.py ##########################
#    loader_pdf = PyPDFLoader(pdf_path)
#    pages_pdf = loader_pdf.load()

# Remove for new structure in load-resume-data.py ##########################
#     token_splitter = TokenTextSplitter(
#        encoding_name="cl100k_base",
#        chunk_size=200,
#        chunk_overlap=40
#    )

# Remove for new structure in load-resume-data.py ##########################
#    docs_list_tokens_split = token_splitter.split_documents(pages_pdf)

    embedding = OpenAIEmbeddings(model='text-embedding-3-small')

    persist_dir = os.path.join(BASE_DIR, "chroma_db")

    # 🔍 Check if vectorstore exists
    if not os.path.exists(persist_dir) or not os.listdir(persist_dir):
        logger.info("No vectorstore found. Building new one...")
        build_vectorstore()
    else:
        logger.info("Existing vectorstore found. Loading...")

    vectorstore = Chroma(
        persist_directory=persist_dir,
        embedding_function=embedding
    )

    retriever = vectorstore.as_retriever(
        search_type='mmr',
        search_kwargs={'k': 3, 'lambda_mult': 0.7}  # fixed typo
    )

    PROMPT_RETRIEVING_S = """
        You will receive a question from a human resource professional about Michael Steffee. 
        Answer using his resume context and 
        public information about the more than 50 companies he has worked for.  
        Treat the information found under the heading Consulting Work Experience like any other job.
        Answer questions like "Did Michael work at XX company ?" with information about the work Michael did there
        and information about the company
        """

    PROMPT_TEMPLATE_RETRIEVING_H = """This is the question:
{question}

This is the context:
{context}"""

    prompt_retrieving_s = SystemMessage(PROMPT_RETRIEVING_S)
    prompt_template_retrieving_h = HumanMessagePromptTemplate.from_template(PROMPT_TEMPLATE_RETRIEVING_H)

    chat_prompt_template_retrieving = ChatPromptTemplate([
        prompt_retrieving_s,
        prompt_template_retrieving_h
    ])

    str_output_parser = StrOutputParser()

    chain = (
        {'context': retriever, 'question': RunnablePassthrough()}
        | chat_prompt_template_retrieving
        | chat
        | str_output_parser
    )

    logger.info("Chat Chain Built")

    return chain

def save_to_file(user_input, ai_response):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    log_dir = os.path.join(current_app.root_path, "logs")
    os.makedirs(log_dir, exist_ok=True)

    file_path = os.path.join(log_dir, "chat_history.txt")

    with open(file_path, "a", encoding="utf-8") as f:
        f.write(f"[{timestamp}] User: {user_input}\n")
        f.write(f"[{timestamp}] ChatGPT: {ai_response}\n")
        f.write("-" * 20 + "\n")

	# change to use app logger
	# current_app.logger.info(f"User: {user_input}")
	# current_app.logger.info(f"ChatGPT: {ai_response}")

def get_response(question):
    chain = build_chain()

    response = chain.stream(question)
    full_response_content = ""

    for chunk in response:
        if hasattr(chunk, 'choices'):
            content = chunk.choices[0].delta.content
            if content:
                full_response_content += content
        else:
            full_response_content += chunk

    logger.info("Response Received ?")

    save_to_file(question, full_response_content)
    return full_response_content
