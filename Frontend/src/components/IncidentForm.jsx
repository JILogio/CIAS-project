import { useState } from 'react'
import { createIncident } from '../api/incidents'
import '../styles/form.css'

function IncidentForm({ onIncidentCreated }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [severity, setSeverity] = useState('low')
  const [service, setService] = useState('')
  const [reportedBy, setReportedBy] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')

    try {
      await createIncident({
        title,
        description,
        severity,
        service,
        reportedBy,
      })

      setMessage('Incidencia creada exitosamente.')
      setMessageType('success')
      setTitle('')
      setDescription('')
      setSeverity('low')
      setService('')
      setReportedBy('')
      setTimeout(() => {
        setMessage('')
        setMessageType('')
      }, 5000)
      if (onIncidentCreated) onIncidentCreated()
    } catch (error) {
      setMessage('Error al crear la incidencia. Inténtalo de nuevo.')
      setMessageType('error')
      console.error('Error creating incident:', error)
      setTimeout(() => {
        setMessage('')
        setMessageType('')
      }, 5000)
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>Nueva incidencia</h2>

      {message && (
        <div className={`alert alert-${messageType}`}>
          {message}
        </div>
      )}

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
