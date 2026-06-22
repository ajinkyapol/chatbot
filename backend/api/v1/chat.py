import uuid
import json
from backend.schemas.models import ChatRequest, ChatResponse
from langchain_core.messages import HumanMessage
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
import os

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))
router = APIRouter(prefix="/api/v1", tags=["chat"])

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, http_request: Request):
    # Generate thread_id if not provided
    thread_id = request.thread_id or str(uuid.uuid4())
    
    graph = http_request.app.state.graph
    config = {"configurable": {"thread_id": thread_id}}
    response = await graph.ainvoke(
        {"messages": [HumanMessage(content=request.message)]},
        config=config
    )
    
    return {
        "response": response['messages'][-1].content,
        "thread_id": thread_id
    }

@router.post("/chat/stream")
async def chat_stream(request: ChatRequest, http_request: Request):
    # Generate thread_id if not provided
    thread_id = request.thread_id or str(uuid.uuid4())
    graph = http_request.app.state.graph
    
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
            
            # Stream from graph for token-by-token streaming with persistence
            async for chunk, metadata in graph.astream(
                {"messages": [HumanMessage(content=request.message)]},
                config=config,
                stream_mode="messages"
            ):
                if hasattr(chunk, 'content') and chunk.content:
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