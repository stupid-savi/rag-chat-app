from dotenv import load_dotenv
import os
from langchain_groq import ChatGroq
from langchain_ollama import OllamaLLM
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_ollama import OllamaEmbeddings
from langchain.chains import create_retrieval_chain
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import asyncio

# Load the env variables else terminate the program
try:
    load_dotenv()
    print("env variables loaded successfully..............")
except ImportError:
    raise ImportError("Error loading env variable.........")

GROQ_API_KEY=os.getenv("GROQ_API_KEY")

# ChatGroq is a class which is used to connect to GROQ's API for chat-based LLMs
# Instead of ChatGroq we can connect to an ollama based LLMs using OllamaLLM & to openai LLMs like ChatOpenAI
llm=ChatGroq(
    model="llama-3.3-70b-versatile", # We can change this model base don available on Groq platform
    temperature=0.9, # Higher the value more creative, lower the value less creative, value range is 0-1
    groq_api_key=GROQ_API_KEY # For GroqChat we need to pass it explicitly, not needed to pass it in case of OpenAI. OpenAI can read it from environment
)


# System Prompt
system_prompt=SystemMessagePromptTemplate.from_template(
"""
You are a knowledgeable, polite, and professional assistant.
Only answer questions based on the provided <context>. Do not use any external knowledge.
Use clear and simple language.
If the answer is not found in the context, respond with:
"I'm sorry, but the information you requested is not available in the provided context."
"""
)

# Human_Prompt
# Here context is the documents or records returned from vector database and input is user question
human_prompt = HumanMessagePromptTemplate.from_template("""
<context>
{context} 
</context>

Question: {input}
""")

# Define the prompt structure for a consistence answers. Here we write instructions for the LLMs.
prompt=ChatPromptTemplate(
[system_prompt, human_prompt]
)

# create_stuff_documents_chain is used to combine multiple documents. What it means that it takes the user query which is in prompt
# and combine it with the returned documents from vector databases. Combine both vector databases result & user query as one long prompt 
# and passes it to llm that is our AI Model and gets the answer in return.
document_chain=create_stuff_documents_chain(llm,prompt)


# Loading knowledge source 
loader = DirectoryLoader(
    path="./knowledge-source",
    glob="**/*.txt",  # This will recursively find all .txt files
    loader_cls=TextLoader # It reads plain text files and returns them as Document objects. 
)

# Loading knowledge data in memory
document = loader.load()

# make chunks of document by 300 characters of each chunk having overlapping characters 60  to preserve the
# context and RecursiveCharacterTextSplitter is smart it tries to split on natural boundaries (like paragraphs → sentences → words → characters), falling back gracefully.
text_splitter=RecursiveCharacterTextSplitter(chunk_size=300, chunk_overlap=60)
docs=text_splitter.split_documents(document)

# Store the chunked docs with their respective embeddings in the vector store
# This line creates a FAISS vector store from your docs.
vectors=FAISS.from_documents(
    docs,
    OllamaEmbeddings(model="nomic-embed-text") # We can add here other embeddings models
)

# This converts the FAISS vector store into the retriever which will query with the user prompt 
# and returns the most relevant documents from the vectore store
retriever=vectors.as_retriever()

# create_retrieval_chain will create a RAG Pipeline. It will take the retrieval and document chain as arguments
# the retrievel will fetch the most relevant documenst using user query from the vector store and the relevant documents
# will be passed to the document_chain and specifically in document chain it passed to prompt. Now document chain will trigger
# it will pass the prompt which have user query & relevant records to the llm and returns the result from the llm. So this retriver chain will 
# returns the answer from llm
retriever_chain=create_retrieval_chain(retriever,document_chain)

app=FastAPI()
origins=["http://locathost:3000", "*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_headers="*",
    allow_methods="*"
)

@app.post("/ask")
async def ask_question(request: Request):
    request_paylaod=await request.json()
    question=request_paylaod.get("input", "") # Empty string represents the default value
    async def generate_stream(): # it's a generator function
        # Langchain way of dealing with asynchronous streaming response from LLM.
        async for chunk in retriever_chain.astream({'input' : question}):
            if "answer" in chunk:
                yield chunk["answer"] # Retrun the answer and pause the generater function for next chunk
                await asyncio.sleep(0.02) # 0.02 seconds delay for typing effect
    return StreamingResponse(generate_stream(), media_type="text/event-stream")


# __name__ is a special variable in python. if this main script run directly then __name__ will be __main__ and 
# if imported as import main then it also be main 

if __name__ == "__main__" :
    import uvicorn
    # uvicorn is used to run the server taking an fastapi app instance
    uvicorn.run(app, host="0.0.0.0", port=8000)

