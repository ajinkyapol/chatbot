from sys import prefix
from backend.schemas.models import ChatRequest, ChatResponse
from backend.services.langgraph.graph import graph
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, BaseMessage
from fastapi import APIRouter 
from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
router = APIRouter(prefix="/api/v1", tags=["chat"])

@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):

    msg = request.message
    HumanMessage(content=msg)
    response = graph.invoke({"messages": [HumanMessage(content=msg)]})
    return {"response": response['messages'][-1].content}