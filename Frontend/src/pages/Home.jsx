import IncidentForm from '../components/IncidentForm'
import IncidentList from '../components/IncidentList'
import '../styles/dashboard.css'

function Home() {
  return (
    <div className="dashboard">
      <div className="dashboard-left">
        <IncidentForm />
      </div>

    {/*
      <div className="dashboard-right">
        <IncidentList />
      </div>
    */}

    </div>
  )
}

export default Home
