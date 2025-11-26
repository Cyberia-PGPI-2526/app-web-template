import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { getUser, updateUser } from "../../service/users.service"
import Toast from "../../components/Toast"

const schema = z.object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    email: z.string().email("Email inválido"),
    role: z.enum(["ADMIN", "CUSTOMER"], { errorMap: () => ({ message: "Rol inválido" }) }),
    password: z.string().optional().or(z.literal("")).refine(
        (val) => val === "" || val.length >= 4,
        { message: "La contraseña debe tener al menos 4 caracteres" }
    )
})

export default function User() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [toast, setToast] = useState(null)

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: zodResolver(schema),
    })

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await getUser(id)
                reset({
                    name: res.name,
                    email: res.email,
                    role: res.role,
                    password: ""
                })
            } catch {
                setError("Error al cargar el usuario")
            } finally {
                setIsLoading(false)
            }
        }

        fetchUser()
    }, [id, reset])

    const onSubmit = async (data) => {
        const res = await updateUser(id, data)

        if (res.error) {
            setError(res.error)
            setToast({ message: res.error, type: "error" })
            return
        }

        setToast({ message: "Usuario actualizado exitosamente", type: "success" })
        setTimeout(() => navigate("/users"), 1500)
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh] bg-[#f7f7f7]">
                <div className="text-xl text-[#009BA6]">Cargando usuario...</div>
            </div>
        )
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-[#f7f7f7]">
            <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-semibold text-[#009BA6]">Editar Usuario</h1>
                    <button
                        onClick={() => navigate("/users")}
                        className="text-[#009BA6] text-xl font-semibold hover:text-[#007a82] transition duration-300"
                    >
                        ✖
                    </button>
                </div>
                <p className="text-gray-600 text-center mb-6">Modifica la información del usuario</p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="relative">
                        <label htmlFor="name" className="block text-lg font-medium text-gray-700 mb-2">
                            Nombre *
                        </label>
                        <input
                            {...register("name")}
                            type="text"
                            id="name"
                            className="w-full border border-gray-300 rounded-lg p-4 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#009BA6] transition duration-300"
                            placeholder="Escribe el nombre"
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                    </div>

                    <div className="relative">
                        <label htmlFor="email" className="block text-lg font-medium text-gray-700 mb-2">
                            Email *
                        </label>
                        <input
                            {...register("email")}
                            type="email"
                            id="email"
                            className="w-full border border-gray-300 rounded-lg p-4 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#009BA6] transition duration-300"
                            placeholder="Escribe el email"
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                    </div>

                    <div className="relative">
                        <label htmlFor="role" className="block text-lg font-medium text-gray-700 mb-2">
                            Rol *
                        </label>
                        <select
                            {...register("role")}
                            id="role"
                            className="w-full border border-gray-300 rounded-lg p-4 text-gray-700 focus:ring-2 focus:ring-[#009BA6] transition duration-300"
                        >
                            <option value="CUSTOMER">Cliente</option>
                            <option value="ADMIN">Administrador</option>
                        </select>
                        {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>}
                    </div>

                    <div className="relative">
                        <label htmlFor="password" className="block text-lg font-medium text-gray-700 mb-2">
                            Contraseña
                        </label>
                        <input
                            {...register("password")}
                            type="password"
                            id="password"
                            placeholder="Dejar en blanco para mantener la actual"
                            className="w-full border border-gray-300 rounded-lg p-4 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#009BA6] transition duration-300"
                        />
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                        <p className="text-gray-500 text-xs mt-1">Solo completa si deseas cambiar la contraseña</p>
                    </div>

                    {error && (
                        <div className="bg-red-100 text-red-700 p-3 rounded-lg shadow-md">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-4 pt-6">
                        <button
                            type="button"
                            onClick={() => navigate("/users")}
                            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-5 rounded-lg transition duration-300"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="w-full bg-[#009BA6] text-white font-semibold py-3 px-5 rounded-lg shadow-lg hover:bg-[#007a82] transition duration-300"
                        >
                            Guardar Cambios
                        </button>
                    </div>
                </form>

                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )}
            </div>
        </div>
    )
}
