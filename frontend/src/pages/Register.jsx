import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerUser } from "../service/auth.service"

const schema = z
  .object({
    name: z.string().min(2, "El nombre es obligatorio"),
    email: z.string().email("Email inválido"),
    phone_number: z
      .string()
      .regex(/^\+?\d[\d\s]{7,14}$/, "Número de teléfono inválido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    repeatPassword: z.string(),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: "Las contraseñas no coinciden",
    path: ["repeatPassword"],
  })

export default function Register() {
  const navigate = useNavigate()
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    const res = await registerUser(data)
    if (res.error) {
      setError(res.error)
      return
    }
    navigate("/login")
  }

  const togglePassword = () => setShowPwd(!showPwd)

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 bg-gray-50">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md md:max-w-lg lg:max-w-xl bg-white p-8 rounded-xl shadow-md flex flex-col gap-6"
      >
        <h2 className="text-2xl font-bold text-gray-900 text-center">Registro</h2>

        <div className="flex flex-col">
          <label htmlFor="name" className="mb-2 font-medium text-gray-700">
            Nombre
          </label>
          <input
            {...register("name")}
            type="text"
            id="name"
            className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#009BA6]"
          />
          {errors.name && (
            <p className="text-red-500 mt-1 text-sm">{errors.name.message}</p>
          )}
        </div>

        <div className="flex flex-col">
          <label htmlFor="email" className="mb-2 font-medium text-gray-700">
            Email
          </label>
          <input
            {...register("email")}
            type="text"
            id="email"
            placeholder="jhondoe@gmail.com"
            className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#009BA6]"
          />
          {errors.email && (
            <p className="text-red-500 mt-1 text-sm">{errors.email.message}</p>
          )}
        </div>

        <div className="flex flex-col">
          <label htmlFor="phone_number" className="mb-2 font-medium text-gray-700">
            Número de teléfono
          </label>
          <input
            {...register("phone_number")}
            type="text"
            id="phone_number"
            placeholder="+34 123456789"
            className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#009BA6]"
          />
          {errors.phone_number && (
            <p className="text-red-500 mt-1 text-sm">{errors.phone_number.message}</p>
          )}
        </div>

        <div className="flex flex-col">
          <label htmlFor="password" className="mb-2 font-medium text-gray-700">
            Contraseña
          </label>
          <div className="relative w-full">
            <input
              {...register("password")}
              type={showPwd ? "text" : "password"}
              id="password"
              className="w-full border border-gray-200 rounded-lg p-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[#009BA6]"
            />
            <button
              type="button"
              onClick={togglePassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#009BA6] font-semibold hover:text-[#00777F] transition"
            >
              {showPwd ? "Ocultar" : "Mostrar"}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 mt-1 text-sm">{errors.password.message}</p>
          )}
        </div>

        {/* Repite contraseña */}
        <div className="flex flex-col">
          <label htmlFor="repeatPassword" className="mb-2 font-medium text-gray-700">
            Repite la contraseña
          </label>
          <input
            {...register("repeatPassword")}
            type={showPwd ? "text" : "password"}
            id="repeatPassword"
            className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#009BA6]"
          />
          {errors.repeatPassword && (
            <p className="text-red-500 mt-1 text-sm">{errors.repeatPassword.message}</p>
          )}
        </div>

        {error && <p className="text-red-500 text-center">{error}</p>}

        {/* Botón submit */}
        <button
          type="submit"
          className="bg-[#009BA6] hover:bg-[#00777F] text-white font-semibold py-3 rounded-lg transition"
        >
          Registrarse
        </button>
      </form>
    </div>
  )
}
