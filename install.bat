conda create --name mds_chatbot_3 python=3.13
conda activate mds_chatbot_3
pip install python-dotenv 
pip install langchain langchain-community langchain-text-splitters 
pip install langchain-openai langchain-chroma chromadb tiktoken pypdf
pip install openai
pip install flask
conda install notebook
conda install ipykernel
python -m ipykernel install --user --name=mds_chatbot_3 --display-name="Python 3.13 mds_chatbot_3"
