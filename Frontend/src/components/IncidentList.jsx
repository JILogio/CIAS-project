import { useEffect, useState } from 'react'
import { getAllIncidents } from '../api/incidents'
import '../styles/incidents.css'

function IncidentList({ refreshTrigger }) {
  const [allIncidents, setAllIncidents] = useState([])
  const [filteredIncidents, setFilteredIncidents] = useState([])
  const [severityFilter, setSeverityFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(4)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/incidents/all?limit=100`)
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`)
        }
        const data = await response.json()
        if (data && Array.isArray(data.items)) {
          const sortedItems = data.items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          setAllIncidents(sortedItems)
          setFilteredIncidents(sortedItems)
        } else {
          throw new Error('La respuesta de la API no contiene un array válido en "items"')
        }
      } catch (error) {
        console.error('Error fetching incidents:', error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }
    fetchIncidents()
  }, [refreshTrigger])

  useEffect(() => {
    if (Array.isArray(allIncidents)) {
      let filtered = allIncidents
      if (severityFilter !== 'all') {
        filtered = allIncidents.filter(incident => incident.severity === severityFilter)
      }
      setFilteredIncidents(filtered)
      setCurrentPage(1) // Reset to first page on filter change
    }
  }, [severityFilter, allIncidents])

  const totalPages = Array.isArray(filteredIncidents) ? Math.ceil(filteredIncidents.length / itemsPerPage) : 0
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentIncidents = Array.isArray(filteredIncidents) ? filteredIncidents.slice(startIndex, startIndex + itemsPerPage) : []

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  if (loading) {
    return <div>Cargando incidencias...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div>
      <h2>Lista de Incidencias</h2>

      <div className="filter-container">
        <label htmlFor="severity-filter">Filtrar por criticidad:</label>
        <select
          id="severity-filter"
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
        >
          <option value="all">Todas</option>
          <option value="low">Baja</option>
          <option value="medium">Media</option>
          <option value="high">Alta</option>
        </select>
      </div>

      <div className="incident-list">
        {currentIncidents.map((incident) => (
          <div key={incident.incidentId} className={`incident-card ${incident.severity}`}>
            <div className="incident-info">
              <span className="incident-title">{incident.title}</span>
              <span className="incident-severity">{incident.severity.toUpperCase()}</span>
              <span className="incident-status">{incident.status}</span>
              <span className="incident-service">{incident.service}</span>
              <span className="incident-reported">{incident.reportedBy}</span>
              <span className="incident-date">{formatDate(incident.createdAt)}</span>
            </div>
            <div className="incident-description">{incident.description}</div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          <span>Página {currentPage} de {totalPages}</span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  )
}

export default IncidentList
