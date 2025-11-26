import { api } from "./api"

export const getAllServices = async () => {
    try {
        const response = await api.get('/services/all')
        return { services: response.data }
    } catch (error) {
        return { error: 'Error al cargar servicios' }
    }
}

export const getEnabledServices = async () => {
    try {
        const response = await api.get('/services')
        return { services: response.data }
    } catch (error) {
        return { error: 'Error al cargar servicios' }
    }
}

export const getService = async (id) => {
    try {
        const response = await api.get(`/services/${id}`)
        return response.data
    } catch (error) {
        return { error: 'Error al cargar servicio' }
    }
}

export const createService = async (data) => {
    try {
        const response = await api.post('/services', data)
        return response.data
    } catch (error) {
        if (error.response) {
            const status = error.response.status
            const data = error.response.data

            if (status === 422 && data.errors) {
                return { error: 'Datos inválidos', errors: data.errors }
            }
            if (status === 400 && data.message) {
                return { error: data.message }
            }

            return { error: "Error inesperado" }
        }

        return { error: "No se pudo conectar con el servidor" }
    }
}

export const updateService = async (id, data) => {
    try {
        const response = await api.put(`/services/${id}`, data)
        return response.data
    } catch (error) {
        if (error.response) {
            const status = error.response.status
            const data = error.response.data

            if (status === 422 && data.errors) {
                return { error: 'Datos inválidos', errors: data.errors }
            }
            if (status === 400 && data.message) {
                return { error: data.message }
            }

            return { error: "Error inesperado" }
        }

        return { error: "No se pudo conectar con el servidor" }
    }
}

export const deleteService = async (id) => {
    try {
        const response = await api.delete(`/services/${id}`)
        return response.data
    } catch (error) {
        if (error.response) {
            const status = error.response.status
            const data = error.response.data

            if (status === 400 && data.message) {
                return { error: data.message }
            }

            return { error: "Error inesperado al eliminar" }
        }

        return { error: "No se pudo conectar con el servidor" }
    }
}
