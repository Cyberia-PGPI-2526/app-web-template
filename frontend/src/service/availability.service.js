import { api } from "./api"

export const getAvailableHours = async (date) => {
  try {
    const formattedDate = date.split("T")[0]
    const response = await api.get(`availability/${formattedDate}`)
    return response.data
  } catch (error) {
    return { availableHours: [], error: "No se pudieron cargar las horas disponibles" }
  }
}

export const createBlock = async (data) => {
  try {
    const response = await api.post("/availability/block", data)
    return response.data
  } catch (error) {
    if (error.response) {
      const status = error.response.status
      const msg = error.response.data?.error || "Error inesperado"
      return { error: msg, status }
    }

    return { error: "Error de conexión con el servidor" }
  }
}

export const deleteBlock = async (id) => {
  try {
    const response = await api.delete(`/availability/block/${id}`)
    return response.data
  } catch (error) {
    if (error.response) {
      const status = error.response.status
      const msg = error.response.data?.error || "Error inesperado"
      return { error: msg, status }
    }

    return { error: "Error de conexión con el servidor" }
  }
}

export const getCalendarData = async () => {
  try {
    const response = await api.get('/availability/calendar/data')
    return response.data
  } catch (error) {
    return { appointments: [], blockedSlots: [], error: "Error al cargar datos del calendario" }
  }
}

export const getBlockedSlots = async () => {
  try {
    const response = await api.get('/availability/blocks')
    return response.data
  } catch (error) {
    return { blockedSlots: [], error: "Error al cargar bloqueos" }
  }
}

export const updateBlock = async (id, data) => {
  try {
    const response = await api.put(`/availability/block/${id}`, data)
    return response.data
  } catch (error) {

    if (error.response) {
      const status = error.response.status
      const msg = error.response.data?.error || "Error inesperado"
      return { error: msg, status }
    }

    return { error: "Error de conexión con el servidor" }
  }
}
