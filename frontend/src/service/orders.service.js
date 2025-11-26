import { api } from "./api"


export const getMyOrders = async (page = 1, limit = 10) => {
    try {
        const response = await api.get(`/orders/me?page=${page}&limit=${limit}`)
        return response.data
    } catch (error) {
        console.log(error)
        return { orders: [], total: 0, error: "No se pudieron cargar sus pedidos" }
    }
}


export const getOrders = async (page = 1, limit = 10) => {
    try {        
        const response = await api.get(`/orders?page=${page}&limit=${limit}`)
        return response.data
    } catch (error) {
        console.log(error)
        return { orders: [], total: 0, error: "No autorizado para ver todos los pedidos" }
    }
}