import os
from dotenv import load_dotenv
from .state import ChatState
from langchain_openai import ChatOpenAI

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '..', '.env'))
llm = ChatOpenAI(model="gpt-4o-mini")

def chat_node(state: ChatState):
    messages = state.messages
    response = llm.invoke(messages)
    return {'messages': [response]}