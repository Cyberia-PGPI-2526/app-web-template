import { api } from "./api"

export const sendMessage = async (data) => {
    try {
        const response = await api.post('/chat/message', data)
        return response.data
    } catch (error) {
        if (error.response) {
            const status = error.response.status
            const data = error.response.data

            if (status === 400 && data.message) {
                return { error: data.message }
            }

            return { error: "Unexpected error" }
        }

        return { error: "Could not connect to the server" }
    }
}

export const sendOrder = async (data) => {
    try {
        const response = await api.post('/chat/order', data)
        return response.data
    } catch (error) {
        if (error.response) {
            const status = error.response.status
            const data = error.response.data

            if (status === 400 && data.message) {
                return { error: data.message }
            }

            return { error: "Unexpected error" }
        }

        return { error: "Could not connect to the server" }
    }
}