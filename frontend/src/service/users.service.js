import { api } from "./api"

export const getUserProfile = async () => {
    try {
        const response = await api.get('/users/me/profile')
        return response.data
    } catch (error) {
    }
}

export const editProfile = async (data) => {
    try {
        const response = await api.put('/users/me/profile', data)
        return response.data
    } catch (error) {
    }
}

export const getUsers = async (page) => {
    try {
        const response = await api.get(`/users?page=${page}`)
        return response.data
    } catch (error) {
    }
}

export const getUser = async (id) => {
    try {
        const response = await api.get(`/users/${id}`)
        return response.data
    } catch (error) {
    }
}

export const updateUser = async (id, data) => {
    try {
        const response = await api.put(`/users/${id}`, data)
        return response.data
    } catch (error) {
        if (error.response) {
            const status = error.response.status
            const data = error.response.data

            if (status === 400 && data.message) {
                return { error: data.message }
            }

            return { error: "Error inesperado" }
        }

        return { error: "No se pudo conectar con el servidor" }
    }
}


export const deleteUser = async (id) => {
    try {
        const response = await api.delete(`/users/${id}`)
        return response.data
    } catch (error) {
        if(error.response.status === 400) {
            return { error: true, message: error.response.data.message }
        }
    }
}