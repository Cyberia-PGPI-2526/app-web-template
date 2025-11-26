import { useEffect, useState } from "react"
import Toast from "../../components/Toast"
import {
  getAppointments,
  confirmAppointment,
  cancelAppointment,
} from "../../service/appointment.service"

export default function Reservations() {
  const [appointments, setAppointments] = useState([])
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [canceling, setCanceling] = useState(false)

  const loadData = async (pageToLoad = page) => {
    setIsLoading(true)
    try {
      const res = await getAppointments(pageToLoad, limit)
      const visible = (res.appointments || []).filter(
        (a) => a.state !== "CANCELED" && a.state !== "COMPLETED"
      )
      setAppointments(visible)
      setTotalPages(res.totalPages || 1)
      setPage(res.page || pageToLoad)
    } catch (e) {
      setToast({ message: "Error cargando reservas", type: "error" })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData(1)
  }, [])

  const prevPage = () => {
    if (page <= 1) return
    loadData(page - 1)
  }

  const nextPage = () => {
    if (page >= totalPages) return
    loadData(page + 1)
  }

  const handleConfirm = async (id) => {
    const res = await confirmAppointment(id)
    if (res.error) {
      setToast({ message: res.error, type: "error" })
      return
    }
    setToast({ message: "Cita confirmada", type: "success" })
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, state: "CONFIRMED" } : a))
    )
  }

  const openCancelModal = (id) => {
    setSelectedId(id)
    setShowCancelModal(true)
  }

  const handleCancel = async () => {
    if (!selectedId) return
    setCanceling(true)
    const res = await cancelAppointment(selectedId)
    if (res.error) {
      setToast({ message: res.error, type: "error" })
    } else {
      setToast({ message: "Reserva cancelada", type: "success" })
      setAppointments((prev) => prev.filter((a) => a.id !== selectedId))
    }
    setCanceling(false)
    setShowCancelModal(false)
    setSelectedId(null)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-xl text-[#009BA6]">Cargando reservas...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#009BA6]">Reservas</h1>
        <p className="text-gray-600 mt-2">Gestiona las citas de los clientes</p>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-[#009BA6] text-white">
              <tr>
                <th className="py-4 px-6 text-left font-semibold">Fecha</th>
                <th className="py-4 px-6 text-left font-semibold">Inicio</th>
                <th className="py-4 px-6 text-left font-semibold">Fin</th>
                <th className="py-4 px-6 text-left font-semibold">Cliente</th>
                <th className="py-4 px-6 text-left font-semibold">Servicio</th>
                <th className="py-4 px-6 text-left font-semibold">Estado</th>
                <th className="py-4 px-6 text-center font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {appointments.length === 0 && (
                <tr>
                  <td
                    className="py-6 px-6 text-center text-gray-600"
                    colSpan="8"
                  >
                    No hay reservas registradas.
                  </td>
                </tr>
              )}
              {appointments.map((a) => {
                const date = new Date(a.appointment_date)
                const start = new Date(a.start_time)
                const end = new Date(a.end_time)

                return (
                  <tr key={a.id} className="hover:bg-gray-50 transition">
                    <td className="py-4 px-6 text-gray-900 font-medium">
                      {date.toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-4 px-6 text-gray-700">
                      {start.toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-4 px-6 text-gray-700">
                      {end.toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-4 px-6 text-gray-700">{a.client?.name}</td>
                    <td className="py-4 px-6 text-gray-700">{a.service?.name}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${a.state === "CONFIRMED"
                            ? "bg-green-100 text-green-700"
                            : a.state === "CANCELED"
                              ? "bg-red-100 text-red-700"
                              : a.state === "COMPLETED"
                                ? "bg-blue-100 text-blue-700"
                                : a.state === "NOT_ASSISTED"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-gray-100 text-gray-700"
                          }`}
                      >
                        {a.state}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-center gap-2">
                        {a.state !== "CONFIRMED" && (
                          <button
                            onClick={() => handleConfirm(a.id)}
                            className="bg-[#009BA6] text-white px-4 py-2 rounded-lg hover:bg-[#007a82] transition font-medium"
                          >
                            Confirmar
                          </button>
                        )}
                        <button
                          onClick={() => openCancelModal(a.id)}
                          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition font-medium"
                        >
                          Cancelar
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación */}
      <div className="flex justify-center items-center mt-8 gap-4">
        <button
          className="px-6 py-3 bg-[#009BA6] text-white rounded-lg hover:bg-[#007a82] transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={prevPage}
          disabled={page <= 1}
        >
          ← Anterior
        </button>
        <span className="text-lg font-semibold text-gray-700">
          Página {page} de {totalPages}
        </span>
        <button
          className="px-6 py-3 bg-[#009BA6] text-white rounded-lg hover:bg-[#007a82] transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={nextPage}
          disabled={page >= totalPages}
        >
          Siguiente →
        </button>
      </div>

      {/* Modal de confirmación de cancelación */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-lg w-80 text-center">
            <h3 className="text-lg font-semibold text-[#009BA6] mb-2">
              Cancelar reserva
            </h3>
            <p className="text-gray-700 mb-4">
              ¿Seguro que deseas cancelar esta cita? Esta acción no se puede
              deshacer.
            </p>

            <div className="flex justify-around">
              <button
                onClick={handleCancel}
                disabled={canceling}
                className="bg-[#009BA6] text-white px-4 py-2 rounded-lg hover:bg-[#00777F] transition"
              >
                {canceling ? "Cancelando..." : "Sí, cancelar"}
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                No, volver
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
