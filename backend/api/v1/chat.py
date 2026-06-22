import uuid
import json
from backend.schemas.models import ChatRequest, ChatResponse
from backend.services.langgraph.graph import graph
from langchain_core.messages import HumanMessage
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
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

@router.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    # Generate thread_id if not provided
    thread_id = request.thread_id or str(uuid.uuid4())
    
    async def generate():
        config = {"configurable": {"thread_id": thread_id}}
        
        try:
            # Send start signal to show avatar immediately
            yield json.dumps({
                "content": "",
                "thread_id": thread_id,
                "done": False,
                "start": True
            }) + "\n"
            
            # Stream directly from LLM for token-by-token streaming
            from backend.services.langgraph.nodes import llm
            messages = [HumanMessage(content=request.message)]
            
            async for chunk in llm.astream(messages):
                if chunk.content:
                    yield json.dumps({
                        "content": chunk.content,
                        "thread_id": thread_id,
                        "done": False
                    }) + "\n"
            
            # Send completion signal
            yield json.dumps({
                "content": "",
                "thread_id": thread_id,
                "done": True
            }) + "\n"
        except Exception as e:
            # Send error signal
            yield json.dumps({
                "content": "",
                "thread_id": thread_id,
                "done": True,
                "error": str(e)
            }) + "\n"
    
    return StreamingResponse(generate(), media_type="text/plain")