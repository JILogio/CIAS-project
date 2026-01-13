import { useState } from 'react'
import IncidentForm from '../components/IncidentForm'
import IncidentList from '../components/IncidentList'
import '../styles/dashboard.css'

function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleIncidentCreated = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div className="dashboard">
      <div className="dashboard-left">
        <IncidentForm onIncidentCreated={handleIncidentCreated} />
      </div>

      <div className="dashboard-right">
        <IncidentList refreshTrigger={refreshTrigger} />
      </div>

    </div>
  )
}

export default Home
