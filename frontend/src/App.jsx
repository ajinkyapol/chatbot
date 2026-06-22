import { useState, useEffect } from 'react'
import { Sidebar } from './components/Sidebar'
import { Header } from './components/Header'
import { MessagesArea } from './components/MessagesArea'
import { InputBox } from './components/InputBox'
import { chatApi } from './api/chat'
import './App.css'

function App() {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState('')
  const [threadId, setThreadId] = useState(null)

  // Load thread_id from localStorage on mount
  useEffect(() => {
    const savedThreadId = localStorage.getItem('chat_thread_id')
    if (savedThreadId) {
      setThreadId(savedThreadId)
    }
  }, [])

  const sendMessage = async (message) => {
    if (!message.trim() || isLoading || isStreaming) return

    // Add user message
    const userMessage = { role: 'user', content: message }
    setMessages(prev => [...prev, userMessage])

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
        // onComplete
        (finalThreadId) => {
          // Save thread_id for persistence
          if (finalThreadId) {
            setThreadId(finalThreadId)
            localStorage.setItem('chat_thread_id', finalThreadId)
          }
          
          // Add complete AI response to messages
          const aiMessage = { role: 'assistant', content: accumulatedContent }
          setMessages(prev => [...prev, aiMessage])
          setStreamingMessage('')
          setIsStreaming(false)
        },
        // onError
        (error) => {
          console.error('Failed to send message:', error)
          // Add error message
          const errorMessage = { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }
          setMessages(prev => [...prev, errorMessage])
          setStreamingMessage('')
          setIsStreaming(false)
        },
        // onStart
        () => {
          // Avatar will show automatically due to isStreaming state
        }
      )
    } catch (error) {
      console.error('Failed to send message:', error)
      // Add error message
      const errorMessage = { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }
      setMessages(prev => [...prev, errorMessage])
      setStreamingMessage('')
      setIsStreaming(false)
    }
  }

  const startNewConversation = () => {
    setMessages([])
    setThreadId(null)
    localStorage.removeItem('chat_thread_id')
  }

  return (
    <div className="app-container">
      <Sidebar onNewChat={startNewConversation} />
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
        />
      </div>
    </div>
  )
}

export default App
