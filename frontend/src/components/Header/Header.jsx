import './Header.css'

export const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-branding">
          <h1 className="header-title">ChatBot</h1>
          <p className="header-subtitle">Your AI Assistant</p>
        </div>
        <div className="header-actions">
          <button className="header-action-button" aria-label="Settings">
            ⚙️
          </button>
        </div>
      </div>
    </header>
  )
}
