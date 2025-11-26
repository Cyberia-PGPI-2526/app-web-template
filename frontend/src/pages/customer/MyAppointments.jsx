import { useEffect, useState } from "react"
import { getMyAppointments } from "../../service/appointment.service"

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError("")
      const data = await getMyAppointments(page, 5)
      if (data.error) {
        setError(data.error)
      } else {
        setAppointments(data.appointments || [])
        setTotalPages(data.totalPages || 1)
      }
      setLoading(false)
    }

    fetchData()
  }, [page])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const formatTime = (timeString) => {
    return new Date(timeString).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStateColor = (state) => {
    switch (state) {
      case "CONFIRMED":
        return "bg-green-100 text-green-700"
      case "PENDING":
        return "bg-yellow-100 text-yellow-700"
      case "CANCELED":
        return "bg-red-100 text-red-700"
      case "COMPLETED":
        return "bg-blue-100 text-blue-700"
      case "NOT_ASSISTED":
        return "bg-gray-200 text-gray-600"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-[#009BA6] mb-6 text-center">
        Mis Citas
      </h1>

      {loading && (
        <div className="text-center text-gray-500">Cargando citas...</div>
      )}

      {error && (
        <div className="text-red-500 text-center mb-4">{error}</div>
      )}

      {!loading && !error && appointments.length === 0 && (
        <div className="text-gray-500 text-center">
          No tienes citas registradas.
        </div>
      )}

      <div className="grid gap-4">
        {appointments.map((appt) => (
          <div
            key={appt.id}
            className="bg-white shadow-md rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {appt.service?.name}
                </h2>
                <p className="text-sm text-gray-500">
                  Fecha: {formatDate(appt.appointment_date)}{" "}
                  <span className="mx-1">•</span>
                  {formatTime(appt.start_time)} - {formatTime(appt.end_time)}
                </p>
                <p className="text-sm text-gray-500">
                  Tipo de sesión: {appt.session_type.replace("_", " ")}
                </p>
              </div>
              <div className="mt-2 sm:mt-0">
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${getStateColor(
                    appt.state
                  )}`}
                >
                  {appt.state === "CONFIRMED"
                    ? "Confirmada"
                    : appt.state === "PENDING"
                    ? "Pendiente"
                    : appt.state === "CANCELED"
                    ? "Cancelada"
                    : appt.state === "COMPLETED"
                    ? "Completada"
                    : appt.state === "NOT_ASSISTED"
                    ? "No asistida"
                    : appt.state}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 space-x-3">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className={`px-4 py-2 rounded-xl text-white font-medium ${
              page === 1
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-[#009BA6] hover:bg-[#007E87]"
            }`}
          >
            Anterior
          </button>

          <span className="text-gray-700">
            Página {page} de {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className={`px-4 py-2 rounded-xl text-white font-medium ${
              page === totalPages
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-[#009BA6] hover:bg-[#007E87]"
            }`}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  )
}
