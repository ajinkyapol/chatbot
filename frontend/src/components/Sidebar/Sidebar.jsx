import './Sidebar.css'

export const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <button className="new-chat-button">
          + New Chat
        </button>
        <nav className="chat-list">
          <ul className="chat-list-items">
            <li className="chat-item">
              <button className="chat-item-button">Chat 1</button>
            </li>
            <li className="chat-item">
              <button className="chat-item-button">Chat 2</button>
            </li>
            <li className="chat-item">
              <button className="chat-item-button">Chat 3</button>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  )
}
