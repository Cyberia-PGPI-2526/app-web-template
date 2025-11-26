import axios from "axios"
import { BACK_URL } from "../config/env"
import { useAuthStore } from "../store/authStore"
import { refreshToken } from "./auth.service"

export const api = axios.create({
    baseURL: `${BACK_URL}/api/v1`,
    withCredentials: true,
})

api.interceptors.request.use(config => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    if (originalRequest.url.includes("/refresh")) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      await refreshToken()
      return api(originalRequest)
    }
    return Promise.reject(error)
  }
)
