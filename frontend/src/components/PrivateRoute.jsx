import { useState, useEffect } from "react"
import { Navigate } from "react-router-dom"
import { validateToken } from "../service/auth.service"
import { useAuthStore } from "../store/authStore"


export default function PrivateRoute({ children }) {
    const { token } = useAuthStore()
    const [isValid, setIsValid] = useState(null)
    
    useEffect(() => {
        const checkToken = async () => {
            if(!token) {
                setIsValid(false)
                return
            }
            try {
                const res = await validateToken()
                if(res?.authenticated) {
                    setIsValid(true)
                } else {
                    setIsValid(false)
                }
            } catch (error) {
                setIsValid(false)
            }
        }
        checkToken()
    }, [token])

    if (isValid === null) return <div>Validating session...</div>

    if (!isValid) return <Navigate to="/login" replace />

    return children
}