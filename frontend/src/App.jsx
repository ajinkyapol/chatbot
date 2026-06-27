import { useState, useEffect, useRef } from 'react'
import { Sidebar } from './components/Sidebar'
import { Header } from './components/Header'
import { MessagesArea } from './components/MessagesArea'
import { InputBox } from './components/InputBox'
import { chatApi } from './api/chat'
import { conversationsStore } from './api/conversations'
import './App.css'

function App() {
  // Derive initial conversation list + active thread lazily so we don't need a
  // mount effect just to read localStorage (avoids cascading-render warnings).
  const initialConversations = conversationsStore.list()
  const initialThreadId = initialConversations[0]?.id ?? null

  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(initialThreadId !== null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState('')
  const [threadId, setThreadId] = useState(initialThreadId)
  const [conversations, setConversations] = useState(initialConversations)

  // Holds the AbortController for the in-flight streaming request, so the
  // user can stop generation. Null when no stream is active.
  const abortControllerRef = useRef(null)

  // Resume the most recent conversation's history on mount (async fetch only)
  useEffect(() => {
    if (!initialThreadId) return
    chatApi.getHistory(initialThreadId)
      .then((history) => {
        setMessages(history)
      })
      .catch((error) => {
        console.error('Failed to resume conversation:', error)
      })
      .finally(() => {
        setIsLoading(false)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fetch and display a conversation's persisted history.
  const loadConversation = (id) => {
    if (id === threadId) return
    setThreadId(id)
    setMessages([])
    setStreamingMessage('')
    setIsLoading(true)
    chatApi.getHistory(id)
      .then((history) => {
        setMessages(history)
      })
      .catch((error) => {
        console.error('Failed to load conversation:', error)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const sendMessage = async (message) => {
    if (!message.trim() || isLoading || isStreaming) return

    const isFirstMessage = messages.length === 0

    // Add user message
    const userMessage = { role: 'user', content: message }
    setMessages(prev => [...prev, userMessage])

    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      setIsStreaming(true)
      setStreamingMessage('')
      let accumulatedContent = ''

      await chatApi.sendMessageStream(
        message,
        threadId,
        // onChunk
        (chunk) => {
          accumulatedContent += chunk
          setStreamingMessage(accumulatedContent)
        },
        // onComplete (also fires on user-initiated stop, with partial content)
        (finalThreadId) => {
          // Persist thread_id and register the conversation
          if (finalThreadId) {
            setThreadId(finalThreadId)
            // Title new conversations from their first message
            const title = isFirstMessage
              ? conversationsStore.titleFrom(message)
              : undefined
            setConversations(conversationsStore.upsert(finalThreadId, title))
          }

          // Add AI response to messages (skip if stopped before any token)
          if (accumulatedContent) {
            const aiMessage = { role: 'assistant', content: accumulatedContent }
            setMessages(prev => [...prev, aiMessage])
          }
          setStreamingMessage('')
          setIsStreaming(false)
          abortControllerRef.current = null
        },
        // onError
        (error) => {
          console.error('Failed to send message:', error)
          const errorMessage = { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }
          setMessages(prev => [...prev, errorMessage])
          setStreamingMessage('')
          setIsStreaming(false)
          abortControllerRef.current = null
        },
        // onStart
        () => {
          // Avatar will show automatically due to isStreaming state
        },
        controller.signal
      )
    } catch (error) {
      console.error('Failed to send message:', error)
      const errorMessage = { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }
      setMessages(prev => [...prev, errorMessage])
      setStreamingMessage('')
      setIsStreaming(false)
      abortControllerRef.current = null
    }
  }

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }

  const startNewConversation = () => {
    if (isStreaming) return
    setMessages([])
    setStreamingMessage('')
    setThreadId(null)
  }

  const renameConversation = (id, title) => {
    const trimmed = title.trim()
    if (!trimmed) return
    setConversations(conversationsStore.rename(id, trimmed))
  }

  const deleteConversation = (id) => {
    const remaining = conversationsStore.remove(id)
    setConversations(remaining)
    if (id === threadId) {
      // Active conversation removed — fall back to most recent or a blank chat
      if (remaining.length > 0) {
        loadConversation(remaining[0].id)
      } else {
        startNewConversation()
      }
    }
  }

  return (
    <div className="app-container">
      <Sidebar
        conversations={conversations}
        activeId={threadId}
        onNewChat={startNewConversation}
        onSelect={loadConversation}
        onDelete={deleteConversation}
        onRename={renameConversation}
      />
      <div className="main-content">
        <Header />
        <MessagesArea
          messages={messages}
          isLoading={isLoading}
          isStreaming={isStreaming}
          streamingMessage={streamingMessage}
        />
        <InputBox
          onSendMessage={sendMessage}
          isLoading={isLoading || isStreaming}
          isStreaming={isStreaming}
          onStop={handleStop}
        />
      </div>
    </div>
  )
}

export default App
