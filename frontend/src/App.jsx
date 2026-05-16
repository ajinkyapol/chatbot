import { Sidebar } from './components/Sidebar'
import { Header } from './components/Header'
import { MessagesArea } from './components/MessagesArea'
import { InputBox } from './components/InputBox'
import './App.css'

function App() {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <MessagesArea />
        <InputBox />
      </div>
    </div>
  )
}

export default App
