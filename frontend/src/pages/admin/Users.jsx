import { useEffect, useState } from "react"
import { getUsers, deleteUser, getUser, updateUser } from "../../service/users.service"
import Toast from "../../components/Toast"
import Modal from "../../components/Modal"
import DeleteUserModal from "../../components/DeletionUserModal"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

const schema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phoneNumber: z.string()
    .min(6, "El número debe tener al menos 6 caracteres")
    .regex(/^[\d+\s-]+$/, "Número inválido"),
  role: z.enum(["ADMIN", "CUSTOMER"], { errorMap: () => ({ message: "Rol inválido" }) }),
  password: z.string().optional().or(z.literal("")).refine(
    (val) => val === "" || val.length >= 4,
    { message: "La contraseña debe tener al menos 4 caracteres" }
  )
})


export default function Users() {
  const [users, setUsers] = useState([])
  const [page, setPage] = useState(null)
  const [totalPages, setTotalPages] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        let currentPage = page || 1
        const res = await getUsers(currentPage)
        setUsers(res.users || [])
        setPage(res.page)
        setTotalPages(res.totalPages)
      } catch (error) {
        setUsers([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchUsers()
  }, [page])

  const prevPage = () => {
    if (page === 1) return
    setPage(page - 1)
  }

  const nextPage = () => {
    if (page === totalPages) return
    setPage(page + 1)
  }

  const handleDeleteClick = (user) => {
    setUserToDelete(user)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return

    const res = await deleteUser(userToDelete.id)

    if (res.error) {
      setToast({ message: res.message, type: "error" })
    } else {
      setUsers(users.filter((user) => user.id !== userToDelete.id))
      setToast({ message: "Usuario eliminado exitosamente", type: "success" })
    }

    setIsDeleteModalOpen(false)
    setUserToDelete(null)
  }

  const handleEdit = async (user) => {
    setEditingUser(user)
    reset({
      name: res.name,
      email: res.email,
      phoneNumber: res.phone_number || "",
      role: res.role,
      password: ""
    })
    setIsModalOpen(true)
  }


  const handleCloseModal = () => {
    if (!isSubmitting) {
      setIsModalOpen(false)
      setEditingUser(null)
      reset()
    }
  }

  const onSubmit = async (data) => {
    setIsSubmitting(true)

    const res = await updateUser(editingUser.id, data)

    setIsSubmitting(false)

    if (res.error) {
      setToast({ message: res.error, type: "error" })
      return
    }

    setToast({ message: "Usuario actualizado exitosamente", type: "success" })
    setIsModalOpen(false)
    setEditingUser(null)

    const currentPage = page || 1
    const refreshRes = await getUsers(currentPage)
    setUsers(refreshRes.users || [])
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#f9fafb]">
        <div className="text-xl text-[#009BA6]">Cargando usuarios...</div>
      </div>
    )
  }

  if (!users.length) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#f9fafb]">
        <div className="text-xl text-gray-500">No se encontraron usuarios.</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-12 bg-[#f9fafb] rounded-lg shadow-xl">

      <div className="mb-8">
        <div className="flex justify-between items-center bg-[#009BA6] text-white py-4 px-6 rounded-lg shadow-md">
          <h1 className="text-4xl font-bold">Gestión de Usuarios</h1>
        </div>
        <p className="text-gray-600 mt-2">Administra los usuarios del sistema</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-[#009BA6] text-white">
              <tr>
                <th className="py-4 px-6 text-left font-semibold">Nombre</th>
                <th className="py-4 px-6 text-left font-semibold">Email</th>
                <th className="py-4 px-6 text-left font-semibold">Rol</th>
                <th className="py-4 px-6 text-center font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user, index) => (
                <tr key={user.id} className="hover:bg-gray-50 transition duration-300">
                  <td className="py-4 px-6 text-gray-900 font-medium">{user.name}</td>
                  <td className="py-4 px-6 text-gray-700">{user.email}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${user.role === "ADMIN" ? "bg-[#009BA6] text-white" : "bg-green-100 text-green-700"
                        }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="bg-[#009BA6] text-white px-4 py-2 rounded-lg hover:bg-[#007a82] transition duration-300"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteClick(user)}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition duration-300"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-center items-center mt-8 gap-4">
        <button
          className="px-6 py-3 bg-[#009BA6] text-white rounded-lg hover:bg-[#007a82] transition duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={prevPage}
          disabled={page <= 1}
        >
          ← Anterior
        </button>
        <span className="text-lg font-semibold text-gray-700">
          Página {page} de {totalPages}
        </span>
        <button
          className="px-6 py-3 bg-[#009BA6] text-white rounded-lg hover:bg-[#007a82] transition duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={nextPage}
          disabled={page === totalPages}
        >
          Siguiente →
        </button>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Editar Usuario">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre *
            </label>
            <input
              {...register("name")}
              type="text"
              id="name"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009BA6] border-gray-300"
              disabled={isSubmitting}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              {...register("email")}
              type="email"
              id="email"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009BA6] border-gray-300"
              disabled={isSubmitting}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Número de Teléfono *
            </label>
            <input
              {...register("phoneNumber")}
              type="text"
              id="phoneNumber"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009BA6] border-gray-300"
              disabled={isSubmitting}
            />
            {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>}
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Rol *
            </label>
            <select
              {...register("role")}
              id="role"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009BA6] border-gray-300"
              disabled={isSubmitting}
            >
              <option value="CUSTOMER">Cliente</option>
              <option value="ADMIN">Administrador</option>
            </select>
            {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>}
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
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009BA6] border-gray-300"
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
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </Modal>

      <DeleteUserModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        userName={userToDelete?.name}
      />
    </div>
  )
}
