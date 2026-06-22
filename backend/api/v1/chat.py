import uuid
from backend.schemas.models import ChatRequest, ChatResponse
from backend.services.langgraph.graph import graph
from langchain_core.messages import HumanMessage
from fastapi import APIRouter
from dotenv import load_dotenv
import os

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))
router = APIRouter(prefix="/api/v1", tags=["chat"])

@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    # Generate thread_id if not provided
    thread_id = request.thread_id or str(uuid.uuid4())
    
    # Invoke graph with config for persistence
    config = {"configurable": {"thread_id": thread_id}}
    response = graph.invoke(
        {"messages": [HumanMessage(content=request.message)]},
        config=config
    )
    
    return {
        "response": response['messages'][-1].content,
        "thread_id": thread_id
    }