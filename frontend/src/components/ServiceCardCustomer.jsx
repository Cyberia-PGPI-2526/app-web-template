import { useNavigate } from 'react-router-dom'

export default function ServiceCardCustomer({ service }) {
  const navigate = useNavigate()

  const handleReserve = () => {
    navigate('/calendar')
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <h3 className="text-2xl font-bold text-[#009BA6] mb-4">{service.name}</h3>
      <p className="text-gray-700 text-sm leading-relaxed mb-6 whitespace-pre-line">
        {service.description}
      </p>
      
      <button
        onClick={handleReserve}
        className="w-full px-6 py-3 bg-[#009BA6] text-white font-semibold rounded-lg hover:bg-[#007a82] transition"
      >
        Reservar ahora
      </button>
    </div>
  )
}
