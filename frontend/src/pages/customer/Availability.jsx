import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { getEnabledServices } from "../../service/services.service"
import { getAvailableHours } from "../../service/availability.service"
import { createAppointment } from "../../service/appointment.service"

export default function Availability() {
  const { date } = useParams()
  const navigate = useNavigate()
  const selectedDate = new Date(date)

  const [hours, setHours] = useState([])
  const [loadingHours, setLoadingHours] = useState(true)
  const [treatment, setTreatment] = useState("")
  const [services, setServices] = useState([])
  const [loadingServices, setLoadingServices] = useState(true)
  const [error, setError] = useState("")

  const [selectedHour, setSelectedHour] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [popupError, setPopupError] = useState("")

  useEffect(() => {
    const fetchServices = async () => {
      setLoadingServices(true)
      setError("")
      const data = await getEnabledServices()
      if (data.error) setError(data.error)
      else setServices(data.services || [])
      setLoadingServices(false)
    }
    fetchServices()
  }, [])

  useEffect(() => {
    const fetchHours = async () => {
      setLoadingHours(true)
      setError("")
      const data = await getAvailableHours(date)
      if (data.error) {
        setError(data.error)
        setHours([])
      } else {
        setHours(data.availableHours || [])
      }
      setLoadingHours(false)
    }
    fetchHours()
  }, [date])

  const showTemporaryError = (message) => {
    setPopupError(message)
    setTimeout(() => setPopupError(""), 3000)
  }

  const handleConfirm = async () => {
    setCreating(true)
    try {
      const [year, month, day] = date.split("-")
      const start = new Date(year, month - 1, day, selectedHour, 0, 0, 0)
      const end = new Date(start.getTime() + 60 * 60 * 1000)

      const payload = {
        appointment_date: date,
        start_time: startTime.toISOString(),
        serviceId: parseInt(treatment)
      }

      const response = await createAppointment(payload)

      if (response?.error) {
        showTemporaryError("Ocurrió un error al crear la cita.")
      } else {
        navigate("/appointments/me")
      }
    } catch (err) {
      showTemporaryError("Ocurrió un error al crear la cita.")
    } finally {
      setCreating(false)
      setShowModal(false)
      setSelectedHour(null)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-6 p-6 bg-white rounded-xl shadow-lg relative">
      {popupError && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {popupError}
        </div>
      )}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-[#009BA6] font-medium hover:text-[#00777F] transition"
      >
        ← Volver al calendario
      </button>

      <h2 className="text-2xl font-bold text-[#009BA6] mb-4 text-center">
        Horas disponibles para {selectedDate.toLocaleDateString("es-ES")}
      </h2>

      <div className="mb-6 relative">
        <label className="block text-gray-700 font-medium mb-2">
          Tipo de tratamiento
        </label>

        {loadingServices ? (
          <p className="text-gray-500 text-sm">Cargando tratamientos...</p>
        ) : error ? (
          <p className="text-red-500 text-sm">{error}</p>
        ) : (
          <div className="relative">
            <select
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              className="
                appearance-none
                w-full p-3 pr-10
                border border-gray-300
                rounded-lg
                bg-white
                focus:outline-none
                focus:ring-2 focus:ring-[#009BA6]
                shadow-sm
                hover:border-[#009BA6]
                transition
                cursor-pointer
              "
            >
              <option value="">Selecciona un tratamiento</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>

            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              <svg
                className="h-5 w-5 text-[#009BA6]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {loadingHours ? (
          <p className="text-gray-500 text-center">Cargando horas disponibles...</p>
        ) : error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : hours.length === 0 ? (
          <p className="text-gray-500 text-center">
            No hay horas disponibles para este día.
          </p>
        ) : (
          hours.map((hour) => (
            <button
              key={hour}
              disabled={!treatment}
              onClick={() => {
                setSelectedHour(hour)
                setShowModal(true)
              }}
              className={`w-full px-4 py-2 rounded transition text-center font-medium ${treatment
                ? "bg-[#009BA6] text-white hover:bg-[#00777F]"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
                }`}
            >
              {hour}
            </button>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-lg w-80 text-center">
            <h3 className="text-lg font-semibold text-[#009BA6] mb-2">
              Confirmar cita
            </h3>
            <p className="text-gray-700 mb-4">
              ¿Confirmas la reserva para las <b>{selectedHour}</b> el{" "}
              {selectedDate.toLocaleDateString("es-ES")}?
            </p>

            <div className="flex justify-around">
              <button
                onClick={handleConfirm}
                disabled={creating}
                className="bg-[#009BA6] text-white px-4 py-2 rounded-lg hover:bg-[#00777F] transition"
              >
                {creating ? "Creando..." : "Confirmar"}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
