import { useState, useEffect } from "react"

export default function ServiceFormModal({ isOpen, onClose, onSubmit, service, isLoading }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    disabled: false
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name || '',
        description: service.description || '',
        disabled: service.disabled || false
      })
    } else {
      setFormData({
        name: '',
        description: '',
        disabled: false
      })
    }
    setErrors({})
  }, [service, isOpen])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  const validate = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio'
    } else if (formData.name.length > 100) {
      newErrors.name = 'El nombre no puede exceder 100 caracteres'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es obligatoria'
    } else if (formData.description.length > 500) {
      newErrors.description = 'La descripción no puede exceder 500 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validate()) return

    onSubmit(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#009BA6]">
              {service ? 'Editar Servicio' : 'Crear Servicio'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
              disabled={isLoading}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Servicio *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009BA6] ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ej: Masaje y Osteopatía"
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Descripción *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="6"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009BA6] ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe el servicio detalladamente..."
                disabled={isLoading}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                {formData.description.length}/500 caracteres
              </p>
            </div>

            {service && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="disabled"
                  name="disabled"
                  checked={formData.disabled}
                  onChange={handleChange}
                  className="h-4 w-4 text-[#009BA6] focus:ring-[#009BA6] border-gray-300 rounded"
                  disabled={isLoading}
                />
                <label htmlFor="disabled" className="ml-2 block text-sm text-gray-700">
                  Deshabilitar servicio (no se mostrará a los clientes)
                </label>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-[#009BA6] text-white rounded-lg hover:bg-[#007a82] transition disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? 'Guardando...' : service ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
