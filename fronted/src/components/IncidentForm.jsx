import { useState } from 'react'
import { createIncident } from '../api/incidents'
import '../styles/form.css'

function IncidentForm() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [severity, setSeverity] = useState('low')
  const [service, setService] = useState('')
  const [reportedBy, setReportedBy] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    await createIncident({
      title,
      description,
      severity,
      service,
      reportedBy,
    })

    // Limpiar formulario
    setTitle('')
    setDescription('')
    setSeverity('low')
    setService('')
    setReportedBy('')
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>Nueva incidencia</h2>

      <input
        type="text"
        placeholder="Título de la incidencia"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <textarea
        placeholder="Descripción del problema"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />

      <input
        type="text"
        placeholder="Servicio afectado (ej. Web Server)"
        value={service}
        onChange={(e) => setService(e.target.value)}
        required
      />

      <input
        type="text"
        placeholder="Reportado por"
        value={reportedBy}
        onChange={(e) => setReportedBy(e.target.value)}
        required
      />

      <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
        <option value="low">Baja</option>
        <option value="medium">Media</option>
        <option value="high">Alta</option>
      </select>

      <button type="submit">Crear incidencia</button>
    </form>
  )
}

export default IncidentForm
