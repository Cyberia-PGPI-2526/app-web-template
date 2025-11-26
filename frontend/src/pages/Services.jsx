import { useEffect, useState } from "react"
import { getEnabledServices } from "../service/services.service"
import ServiceCardCustomer from "../components/ServiceCardCustomer"

export default function Services() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true)
      const result = await getEnabledServices()
      
      if (result.error) {
        setError(result.error)
      } else {
        setServices(result.services || [])
      }
      
      setLoading(false)
    }

    fetchServices()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-xl text-[#009BA6]">Cargando servicios...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#009BA6] mb-2">Nuestros Servicios</h1>
        <p className="text-gray-600">Descubre nuestros tratamientos y reserva tu sesión</p>
      </div>

      {services.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          No hay servicios disponibles en este momento
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service) => (
            <ServiceCardCustomer key={service.id} service={service} />
          ))}
        </div>
      )}
    </div>
  )
}
