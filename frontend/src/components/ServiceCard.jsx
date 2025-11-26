export default function ServiceCard({ service, onEdit, onDelete }) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow ${
      service.disabled ? 'opacity-60 border-2 border-red-200' : ''
    }`}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-bold text-[#009BA6]">{service.name}</h3>
        {service.disabled && (
          <span className="px-3 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded-full">
            Deshabilitado
          </span>
        )}
      </div>
      <p className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-3">
        {service.description}
      </p>
      
      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={() => onEdit(service)}
          className="flex-1 px-4 py-2 bg-[#009BA6] text-white text-sm rounded-lg hover:bg-[#007a82] transition"
        >
          Editar
        </button>
        <button
          onClick={() => onDelete(service)}
          className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition"
        >
          Eliminar
        </button>
      </div>
    </div>
  )
}
