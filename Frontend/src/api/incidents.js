const API_URL = import.meta.env.VITE_API_URL

export async function getIncidents() {
  const response = await fetch(`${API_URL}/incidents`)
  return response.json()
}

export async function createIncident(data) {
  const response = await fetch(`${API_URL}/incidents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  return response.json()
}

export async function updateIncident(id, status) {
  const response = await fetch(`${API_URL}/incidents/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  })

  return response.json()
}
