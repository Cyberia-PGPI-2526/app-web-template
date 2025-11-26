import { useEffect, useState } from "react"
import { getAllServices, createService, updateService, deleteService } from "../../service/services.service"
import ServiceCard from "../../components/ServiceCard"
import ServiceFormModal from "../../components/ServiceFormModal"
import Toast from "../../components/Toast"

export default function Services() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState(null)

  const fetchServices = async () => {
    setLoading(true)
    const result = await getAllServices()
    
    if (result.error) {
      setError(result.error)
    } else {
      setServices(result.services || [])
    }
    
    setLoading(false)
  }

  useEffect(() => {
    fetchServices()
  }, [])

  const handleCreate = () => {
    setEditingService(null)
    setIsModalOpen(true)
  }

  const handleEdit = (service) => {
    setEditingService(service)
    setIsModalOpen(true)
  }

  const handleDelete = async (service) => {
    if (!window.confirm(`¿Estás seguro de eliminar el servicio "${service.name}"?`)) {
      return
    }

    const result = await deleteService(service.id)
    
    if (result.error) {
      setToast({ message: result.error, type: 'error' })
    } else {
      setToast({ message: 'Servicio eliminado exitosamente', type: 'success' })
      fetchServices()
    }
  }

  const handleSubmit = async (formData) => {
    setIsSubmitting(true)
    
    let result
    if (editingService) {
      result = await updateService(editingService.id, formData)
    } else {
      result = await createService(formData)
    }

    setIsSubmitting(false)

    if (result.error) {
      setToast({ message: result.error, type: 'error' })
    } else {
      setToast({ 
        message: editingService ? 'Servicio actualizado exitosamente' : 'Servicio creado exitosamente',
        type: 'success'
      })
      setIsModalOpen(false)
      setEditingService(null)
      fetchServices()
    }
  }

  const handleCloseModal = () => {
    if (!isSubmitting) {
      setIsModalOpen(false)
      setEditingService(null)
    }
  }

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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#009BA6]">Gestión de Servicios</h1>
        <button 
          onClick={handleCreate}
          className="px-6 py-2 bg-[#009BA6] text-white rounded-lg hover:bg-[#007a82] transition"
        >
          Crear Servicio
        </button>
      </div>

      {services.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          No hay servicios registrados
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <ServiceCard 
              key={service.id} 
              service={service}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <ServiceFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        service={editingService}
        isLoading={isSubmitting}
      />

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
