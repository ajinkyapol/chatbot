import { useEffect, useRef } from 'react'
import './MessagesArea.css'

export const MessagesArea = ({ messages, isLoading, isStreaming, streamingMessage }) => {
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading, isStreaming, streamingMessage])

  return (
    <main className="messages-area">
      <div className="messages-content">
        <div className="message-container">
          {messages.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-text">Start a conversation by typing a message below</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div 
                key={index} 
                className={`message ${msg.role === 'user' ? 'message-user' : 'message-assistant'}`}
              >
                <div className={`message-avatar ${msg.role === 'user' ? 'user-avatar' : 'assistant-avatar'}`}>
                  {msg.role === 'user' ? 'U' : 'AI'}
                </div>
                <div className="message-bubble">
                  <p className="message-text">{msg.content}</p>
                </div>
              </div>
            ))
          )}
          {isStreaming && (
            <div className="message message-assistant">
              <div className="message-avatar assistant-avatar">AI</div>
              <div className="message-bubble">
                <p className="message-text">
                  {streamingMessage}<span className="cursor">|</span>
                </p>
              </div>
            </div>
          )}
          {isLoading && !isStreaming && (
            <div className="message message-assistant">
              <div className="message-avatar assistant-avatar">AI</div>
              <div className="message-bubble">
                <p className="message-text typing-indicator">...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </main>
  )
}
