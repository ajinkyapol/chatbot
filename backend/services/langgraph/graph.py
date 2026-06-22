from langgraph.graph import StateGraph, START, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import BaseMessage, AIMessage, HumanMessage, SystemMessage
from langgraph.checkpoint.memory import MemorySaver
from .state import ChatState
from .nodes import chat_node


checkpointer = MemorySaver()
workflow = StateGraph(ChatState)

workflow.add_node("chat", chat_node)
workflow.add_edge(START, "chat")
workflow.add_edge("chat", END)

graph = workflow.compile(checkpointer=checkpointer)
