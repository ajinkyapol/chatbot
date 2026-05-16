from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from backend.schemas.models import ChatRequest, ChatResponse
from backend.api.v1.chat import router as chat_router
from backend.api.v1.health import router as health_router

load_dotenv()

def create_app():

    app = FastAPI(
        title="Chatbot API",
        version="1.0.0",
        description="A simple chatbot API"
    )
    
    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # In production, replace with specific origins
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    app.include_router(chat_router)
    app.include_router(health_router)
    return app

app = create_app()