import { useState, useRef, useEffect } from 'react'
import './InputBox.css'

export const InputBox = () => {
  const [message, setMessage] = useState('')
  const textareaRef = useRef(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [message])

  const handleSend = () => {
    if (message.trim()) {
      console.log('Sending message:', message)
      setMessage('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <footer className="input-box">
      <div className="input-content">
        <div className="input-wrapper">
          <button 
            className="input-action-button attach-button" 
            aria-label="Attach file"
          >
            📎
          </button>
          <textarea
            ref={textareaRef}
            className="message-input"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            rows={1}
          />
          <button 
            className={`input-action-button send-button ${message.trim() ? 'active' : ''}`}
            onClick={handleSend}
            disabled={!message.trim()}
            aria-label="Send message"
          >
            ➤
          </button>
        </div>
      </div>
    </footer>
  )
}
