from pydantic import BaseModel
from langgraph.graph.message import add_messages
from typing import Annotated
from langchain_core.messages import BaseMessage

class ChatState(BaseModel):
    messages: Annotated[list[BaseMessage], add_messages]