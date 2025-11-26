import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginUser } from "../service/auth.service"
import { useAuthStore } from "../store/authStore"

const schema = z.object({
  email: z.email('Email inválido'),
  password: z.string()
})

export default function Login() {
  const [error, setError] = useState(null)
  const [showPwd, setShowPwd] = useState(false)
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    const res = await loginUser(data)
    if (res.error) {
      setError(res.error)
      return
    }
    useAuthStore.getState().login({ token: res.token, userId: res.userId, role: res.role })
    navigate("/")
  }

  const togglePassword = () => setShowPwd(!showPwd)

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 bg-gray-50">
      <form
        className="w-full max-w-md md:max-w-lg lg:max-w-xl bg-white p-8 rounded-xl shadow-md flex flex-col gap-6"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h2 className="text-2xl font-bold text-gray-900 text-center">Login</h2>

        {/* Email */}
        <div className="flex flex-col">
          <label htmlFor="email" className="mb-2 font-medium text-gray-700">Email</label>
          <input
            {...register("email")}
            type="text"
            id="email"
            className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#009BA6]"
            required
          />
          {errors.email && <p className="text-red-500 mt-1 text-sm">{errors.email.message}</p>}
        </div>

        {/* Password con botón dentro */}
        <div className="flex flex-col">
          <label htmlFor="password" className="mb-2 font-medium text-gray-700">Contraseña</label>
          <div className="relative w-full">
            <input
              {...register("password")}
              type={showPwd ? 'text' : 'password'}
              id="password"
              className="w-full border border-gray-200 rounded-lg p-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[#009BA6]"
              required
            />
            <button
              type="button"
              onClick={togglePassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#009BA6] font-semibold hover:text-[#00777F] transition"
            >
              {showPwd ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
          {errors.password && <p className="text-red-500 mt-1 text-sm">{errors.password.message}</p>}
        </div>

        {error && <p className="text-red-500 text-center">{error}</p>}

        {/* Submit */}
        <button 
          type="submit" 
          className="bg-[#009BA6] hover:bg-[#00777F] text-white font-semibold py-3 rounded-lg transition"
        >
          Login
        </button>
      </form>
    </div>
  )
}
