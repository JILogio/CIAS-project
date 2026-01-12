import Home from './pages/Home'
import './styles/App.css'

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>CIAS</h1>
        <p className="app-subtitle">
          Cloud Incident Alert System – Gestión de incidencias técnicas
        </p>
      </header>

      <Home />
    </div>
  )
}

export default App

