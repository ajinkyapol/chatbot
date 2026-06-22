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
  const [threadId, setThreadId] = useState(null)

  // Load thread_id from localStorage on mount
  useEffect(() => {
    const savedThreadId = localStorage.getItem('chat_thread_id')
    if (savedThreadId) {
      setThreadId(savedThreadId)
    }
  }, [])

  const sendMessage = async (message) => {
    if (!message.trim() || isLoading) return

    // Add user message
    const userMessage = { role: 'user', content: message }
    setMessages(prev => [...prev, userMessage])

    try {
      setIsLoading(true)
      const response = await chatApi.sendMessage(message, threadId)
      
      // Save thread_id for persistence
      if (response.thread_id) {
        setThreadId(response.thread_id)
        localStorage.setItem('chat_thread_id', response.thread_id)
      }
      
      // Add AI response
      const aiMessage = { role: 'assistant', content: response.response }
      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Failed to send message:', error)
      // Add error message
      const errorMessage = { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
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
        <MessagesArea messages={messages} isLoading={isLoading} />
        <InputBox onSendMessage={sendMessage} isLoading={isLoading} />
      </div>
    </div>
  )
}

export default App
