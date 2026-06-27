import { useState } from 'react'
import './Sidebar.css'

export const Sidebar = ({
  conversations = [],
  activeId,
  onNewChat,
  onSelect,
  onDelete,
  onRename,
}) => {
  const [editingId, setEditingId] = useState(null)
  const [draftTitle, setDraftTitle] = useState('')

  const startEditing = (conversation) => {
    setEditingId(conversation.id)
    setDraftTitle(conversation.title)
  }

  const commitEditing = () => {
    if (editingId && draftTitle.trim()) {
      onRename(editingId, draftTitle)
    }
    setEditingId(null)
    setDraftTitle('')
  }

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      commitEditing()
    } else if (e.key === 'Escape') {
      setEditingId(null)
      setDraftTitle('')
    }
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <button className="new-chat-button" onClick={onNewChat}>
          + New Chat
        </button>
        <nav className="chat-list">
          {conversations.length === 0 ? (
            <p className="chat-list-empty">No conversations yet</p>
          ) : (
            <ul className="chat-list-items">
              {conversations.map((conversation) => (
                <li
                  key={conversation.id}
                  className={`chat-item ${conversation.id === activeId ? 'chat-item-active' : ''}`}
                >
                  {editingId === conversation.id ? (
                    <input
                      className="chat-item-edit"
                      value={draftTitle}
                      onChange={(e) => setDraftTitle(e.target.value)}
                      onKeyDown={handleEditKeyDown}
                      onBlur={commitEditing}
                      autoFocus
                    />
                  ) : (
                    <>
                      <button
                        className="chat-item-button"
                        onClick={() => onSelect(conversation.id)}
                        onDoubleClick={() => startEditing(conversation)}
                        title={conversation.title}
                      >
                        {conversation.title}
                      </button>
                      <button
                        className="chat-item-rename"
                        onClick={() => startEditing(conversation)}
                        title="Rename conversation"
                        aria-label="Rename conversation"
                      >
                        ✎
                      </button>
                      <button
                        className="chat-item-delete"
                        onClick={() => onDelete(conversation.id)}
                        title="Delete conversation"
                        aria-label="Delete conversation"
                      >
                        ×
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </nav>
      </div>
    </aside>
  )
}
