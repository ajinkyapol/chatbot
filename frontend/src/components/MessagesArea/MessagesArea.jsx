import './MessagesArea.css'

export const MessagesArea = () => {
  return (
    <main className="messages-area">
      <div className="messages-content">
        <div className="message-container">
          <div className="message message-user">
            <div className="message-avatar user-avatar">U</div>
            <div className="message-bubble">
              <p className="message-text">Hello! How can I help you today?</p>
            </div>
          </div>
          <div className="message message-assistant">
            <div className="message-avatar assistant-avatar">AI</div>
            <div className="message-bubble">
              <p className="message-text">Hi! I'm your AI assistant. I can help you with various tasks. What would you like to know?</p>
            </div>
          </div>
          <div className="message message-user">
            <div className="message-avatar user-avatar">U</div>
            <div className="message-bubble">
              <p className="message-text">Can you explain what this chatbot does?</p>
            </div>
          </div>
          <div className="message message-assistant">
            <div className="message-avatar assistant-avatar">AI</div>
            <div className="message-bubble">
              <p className="message-text">This is a chatbot interface designed to help you interact with AI. You can ask questions, get assistance, and have conversations. The sidebar shows your chat history, and you can start new conversations anytime.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
