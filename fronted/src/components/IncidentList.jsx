import { useEffect, useState } from 'react'
import { getIncidents } from '../api/incidents'
import '../styles/incidents.css'


function IncidentList() {
  const [incidents, setIncidents] = useState([])

  useEffect(() => {
    getIncidents().then(setIncidents)
  }, [])

  return (
    <div>
      <h2>Incidencias</h2>

      <ul>
        {incidents.map((incident) => (
            <li className={`incident-card ${incident.severity}`}>
                <div className="incident-title">{incident.title}</div>
                    <div className="incident-meta">
                        <span>{incident.severity.toUpperCase()}</span>
                        <span>{incident.status}</span>
                    </div>
            </li>
        ))}
      </ul>
    </div>
  )
}

export default IncidentList
