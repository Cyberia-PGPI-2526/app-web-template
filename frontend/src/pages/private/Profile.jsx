import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { getUserProfile, editProfile } from "../../service/users.service"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import Toast from "../../components/Toast"
import Modal from "../../components/Modal"

const schema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phoneNumber: z.string()
    .min(6, "El número debe tener al menos 6 caracteres")
    .regex(/^[\d+\s-]+$/, "Número inválido"),
  password: z.string().optional().or(z.literal("")).refine(
    (val) => val === "" || val.length >= 4,
    { message: "La contraseña debe tener al menos 4 caracteres" }
  ),
  role: z.enum(["ADMIN", "CUSTOMER"], { required_error: "Rol inválido" }) // 👈 añadido
})

export default function Profile() {
  const [userData, setUserData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getUserProfile()
        setUserData(res)
        reset({
          name: res.name || "",
          email: res.email || "",
          phoneNumber: res.phone_number || "",
          password: "",
          role: res.role || "CUSTOMER" // 👈 se incluye por defecto
        })
      } catch (error) {
        setUserData(null)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProfile()
  }, [reset])

  const handleEditClick = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    if (!isSubmitting) setIsModalOpen(false)
  }

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    const res = await editProfile(data)
    setIsSubmitting(false)

    if (res.error) {
      setToast({ message: res.error, type: "error" })
      return
    }

    setToast({ message: "Perfil actualizado exitosamente", type: "success" })
    setIsModalOpen(false)

    const updated = await getUserProfile()
    setUserData(updated)
  }

  if (isLoading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-[#009BA6] text-xl animate-pulse">Cargando perfil...</div>
      </div>
    )

  if (!userData)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <p className="text-red-500 text-lg font-semibold">Error al cargar el perfil</p>
      </div>
    )

  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-gray-50 px-4">
      <div className="bg-white shadow-lg rounded-3xl p-10 w-full max-w-lg border-t-4 border-[#009BA6] transition-transform duration-300 hover:-translate-y-1">

        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#009BA6] to-[#007a82] flex items-center justify-center text-white text-5xl font-semibold shadow-md">
              {userData.name ? userData.name[0].toUpperCase() : "?"}
            </div>
            <div
              onClick={handleEditClick}
              className="absolute -bottom-2 right-2 bg-white p-2 rounded-full shadow-md cursor-pointer hover:bg-gray-100 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-[#009BA6]"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M17.414 2.586a2 2 0 010 2.828L8.828 14H6v-2.828l8.586-8.586a2 2 0 012.828 0z" />
                <path
                  fillRule="evenodd"
                  d="M4 16a1 1 0 011-1h9a1 1 0 110 2H5a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-[#009BA6] mt-6">{userData.name}</h1>
          <p className="text-gray-600 text-base mt-1">{userData.email}</p>
          {userData.phone_number && (
            <p className="text-gray-500 text-sm mt-1">📞 {userData.phone_number}</p>
          )}
          <p className="text-xs text-gray-400 mt-2 uppercase tracking-wide">{userData.role}</p>
        </div>

        <div className="flex flex-col gap-4 mt-10">
          <button
            onClick={handleEditClick}
            className="bg-[#009BA6] text-white py-3 px-6 rounded-xl font-semibold hover:bg-[#007a82] transition-all duration-300 transform hover:scale-[1.02] shadow-md"
          >
            Editar Perfil
          </button>
          <Link
            to="/"
            className="text-[#009BA6] hover:text-[#007a82] text-sm font-medium transition duration-300 hover:underline"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Editar Perfil">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register("role")} />

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input
              {...register("name")}
              id="name"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#009BA6]"
              disabled={isSubmitting}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              {...register("email")}
              type="email"
              id="email"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#009BA6]"
              disabled={isSubmitting}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
            <input
              {...register("phoneNumber")}
              type="text"
              id="phoneNumber"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#009BA6]"
              disabled={isSubmitting}
            />
            {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              {...register("password")}
              type="password"
              id="password"
              placeholder="Dejar en blanco para mantener la actual"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#009BA6]"
              disabled={isSubmitting}
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
            <p className="text-gray-500 text-xs mt-1">Solo completa si deseas cambiar la contraseña</p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#009BA6] text-white rounded-lg hover:bg-[#007a82] transition disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </Modal>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  )
}