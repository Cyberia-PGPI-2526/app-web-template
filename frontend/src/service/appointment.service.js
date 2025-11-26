import { api } from "./api"


export const getMyAppointments = async (page = 1, limit = 10) => {
    try {
        const response = await api.get(`/appointments/me?page=${page}&limit=${limit}`)
        return response.data
    } catch (error) {
        return { appointments: [], total: 0, error: "No se pudieron cargar sus citas" }
    }
}


export const getAppointments = async (page = 1, limit = 10) => {
    try {        
        const response = await api.get(`/appointments?page=${page}&limit=${limit}`)
        return response.data
    } catch (error) {
        return { appointments: [], total: 0, error: "No autorizado para ver todas las citas o error del servidor" }
    }
}

export const getAppointment = async (id) => {
    try {
        const response = await api.get(`/appointments/${id}`)
        return response.data
    } catch (error) {
        if (error.response?.status === 404) {
             return { error: "Cita no encontrada" }
        }
        if (error.response?.status === 403) {
             return { error: "No tienes permiso para ver esta cita" }
        }
        return { error: "Error de conexión" }
    }
}

export const createAppointment = async (data) => {
    try {
        const response = await api.post('/appointments', data)
        return response.data
    } catch (error) {
        const status = error.response?.status
        const responseData = error.response?.data

        if ((status === 400 || status === 409) && responseData?.message) {
            return { error: responseData.message }
        }

        return { error: "Error al crear la cita o conflicto de horario" }
    }
}

export const updateAppointment = async (id, data) => {
    try {
        const response = await api.put(`/appointments/${id}`, data)
        return response.data
    } catch (error) {
        const status = error.response?.status
        const responseData = error.response?.data

        if (status === 403) {
            return { error: responseData.message || "No tienes permiso para realizar esta actualización" }
        }
        if ((status === 400 || status === 409) && responseData?.message) {
            return { error: responseData.message }
        }
        
        return { error: "Error al actualizar la cita" }
    }
}

export const deleteAppointment = async (id) => {
    try {
        const response = await api.delete(`/appointments/${id}`)
        return response.data
    } catch (error) {
        
        const status = error.response?.status
        const responseData = error.response?.data
        
        if (status === 403) {
            return { error: responseData.message || "Solo un administrador puede eliminar citas" }
        }
        if (status === 404) {
             return { error: "Cita no encontrada para eliminar" }
        }

        return { error: "Error al eliminar la cita" }
    }
}

// Acciones de administración sobre estados
export const confirmAppointment = async (id) => {
    try {
        const { data } = await api.post(`/appointments/${id}/confirm`)
        return data
    } catch (error) {
        const status = error.response?.status
        if (status === 403) return { error: "Solo un administrador puede confirmar citas" }
        if (status === 404) return { error: "Cita no encontrada" }
        return { error: "Error al confirmar la cita" }
    }
}

export const cancelAppointment = async (id) => {
    try {
        const { data } = await api.post(`/appointments/${id}/cancel`)
        return data
    } catch (error) {
        const status = error.response?.status
        if (status === 403) return { error: "Solo un administrador puede cancelar citas" }
        if (status === 404) return { error: "Cita no encontrada" }
        return { error: "Error al cancelar la cita" }
    }
}

export const completeAppointment = async (id) => {
    try {
        const { data } = await api.post(`/appointments/${id}/complete`)
        return data
    } catch (error) {
        const status = error.response?.status
        if (status === 403) return { error: "Solo un administrador puede completar citas" }
        if (status === 404) return { error: "Cita no encontrada" }
        return { error: "Error al completar la cita" }
    }
}

export const markNoShowAppointment = async (id) => {
    try {
        const { data } = await api.post(`/appointments/${id}/no-show`)
        return data
    } catch (error) {
        const status = error.response?.status
        if (status === 403) return { error: "Solo un administrador puede marcar como no asistida" }
        if (status === 404) return { error: "Cita no encontrada" }
        return { error: "Error al marcar no asistencia" }
    }
}