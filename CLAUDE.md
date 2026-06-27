# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A chatbot with a FastAPI + LangGraph backend (OpenAI `gpt-4o-mini`) and a React 19 + Vite frontend. Conversations are persisted server-side per `thread_id` via LangGraph's SQLite checkpointer.

## Commands

### Backend (run from repository root)
```bash
pip install -r requirements.txt
python server.py            # serves on http://0.0.0.0:9001
```
The backend is a package imported as `backend.main`, so it must be launched from the repo root (e.g. `python server.py`), not from inside `backend/`. `uvicorn backend.main:app --reload --port 9001` also works for hot reload.

Requires `OPENAI_API_KEY` in `.env` at the repo root.

### Frontend (run from `frontend/`)
```bash
npm install
npm run dev       # Vite dev server
npm run build     # production build
npm run lint      # ESLint
npm run preview   # preview built output
```

There is no backend test runner configured yet; `tests/backend` and `tests/frontend` exist but are empty.

## Architecture

### Request flow
`frontend/src/api/chat.js` → FastAPI routers in `backend/api/v1/` → compiled LangGraph workflow (`app.state.graph`) → OpenAI.

- **`backend/main.py`** — builds the FastAPI app. The graph is compiled once in the `lifespan` context manager and stored on `app.state.graph`. The `AsyncSqliteSaver` checkpointer lives for the app's lifetime and writes to `checkpointer.db` (relative to the working directory). CORS is wide open (`*`) — tighten before production.
- **`backend/services/langgraph/`** — the agent. `graph.py` wires a single `chat` node (`START → chat → END`); `nodes.py` defines `chat_node` and instantiates the `ChatOpenAI` model; `state.py` defines `ChatState` (a Pydantic model with a `messages` list using LangGraph's `add_messages` reducer).
- **`backend/api/v1/chat.py`** — two endpoints, both keyed by `thread_id`:
  - `POST /api/v1/chat` — non-streaming, calls `graph.ainvoke`, returns full response.
  - `POST /api/v1/chat/stream` — token streaming via `graph.astream(stream_mode="messages")`, emitting newline-delimited JSON objects (`{content, thread_id, done, start?, error?}`) as `text/plain`.
- **`backend/api/v1/health.py`** — `GET /api/v1/health`.

### Conversation persistence
The client does NOT resend history. Each request carries a `thread_id`; if absent the server generates a UUID and returns it. LangGraph's SQLite checkpointer rehydrates prior messages for that thread, so message history is reconstructed server-side. The frontend persists `thread_id` in `localStorage` (`chat_thread_id`); "New Chat" clears it.

### Frontend
`App.jsx` holds all chat state and drives the streaming flow through `chatApi.sendMessageStream`, which takes `onChunk`/`onComplete`/`onError`/`onStart` callbacks. UI is split into `components/{Sidebar,Header,MessagesArea,InputBox}`, each a folder with a `.jsx`, `.css`, and `index.js` barrel. Note: `frontend/src/api/chat.js` hardcodes `API_BASE_URL = 'http://localhost:9001'` rather than reading `VITE_API_URL` from `.env`.

## Notes / gotchas
- `nodes.py` contains an unused `chat_node_stream` — streaming is actually done by `graph.astream` in the chat router, not by a separate node.
- `backend/config.py` is currently empty.
- `.env` is loaded redundantly in several modules (`main.py`, `chat.py`, `nodes.py`) with differing relative paths — all resolve to the repo-root `.env`.
- The `checkpointer.db*` SQLite files are gitignored; deleting them wipes all conversation history.
