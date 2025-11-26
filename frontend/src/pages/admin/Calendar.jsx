import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import esLocale from '@fullcalendar/core/locales/es'
import { startOfDay, isBefore } from 'date-fns'
import { useAuthStore } from '../../store/authStore'
import Modal from '../../components/Modal'
import Toast from '../../components/Toast'
import { createBlock, getCalendarData, updateBlock, deleteBlock } from '../../service/availability.service'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({
  start_date: z.string().min(1, "Fecha de inicio requerida"),
  end_date: z.string().optional(),
  full_day: z.boolean().default(false),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  reason: z.string().optional()
})
  // Requerir horas si no es día completo
  .refine((data) => {
    if (!data.full_day) {
      return data.start_time && data.end_time
    }
    return true
  }, {
    message: "Hora de inicio y fin son requeridas si no bloqueas día completo",
    path: ["start_time"]
  })
  // Validar que la hora de fin sea posterior
  .refine((data) => {
    if (!data.full_day && data.start_time && data.end_time) {
      const [hStart] = data.start_time.split(":").map(Number)
      const [hEnd] = data.end_time.split(":").map(Number)
      return hEnd > hStart
    }
    return true
  }, {
    message: "La hora de fin debe ser posterior a la hora de inicio",
    path: ["end_time"]
  })

export default function AdminCalendar() {
  const navigate = useNavigate()
  const { role } = useAuthStore()
  const hoy = startOfDay(new Date())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const [calendarEvents, setCalendarEvents] = useState([])
  const [editingBlock, setEditingBlock] = useState(null)

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { full_day: false }
  })

  const fullDay = watch("full_day")

  const loadCalendarData = async () => {
    const data = await getCalendarData()
    const events = []

    // --- Citas confirmadas ---
    if (data.appointments) {
      data.appointments.forEach(apt => {
        const date = new Date(apt.appointment_date)
        const start = new Date(apt.start_time)
        events.push({
          id: `apt-${apt.id}`,
          title: `${start.getHours()} h - ${apt.client.name}`,
          start: date.toISOString().split('T')[0],
          backgroundColor: '#009BA6',
          borderColor: '#009BA6',
          textColor: 'white',
          extendedProps: { type: 'appointment', data: apt }
        })
      })
    }

    // --- Bloqueos ---
    if (data.blockedSlots) {
      const blockGroups = {}
      data.blockedSlots.forEach(block => {
        const key = `${block.reason || 'sin-motivo'}-${block.start_time || 'full'}-${block.end_time || 'full'}`
        if (!blockGroups[key]) blockGroups[key] = []
        blockGroups[key].push(block)
      })

      Object.values(blockGroups).forEach(group => {
        group.sort((a, b) => new Date(a.date) - new Date(b.date))
        group.forEach((block, idx) => {
          const date = new Date(block.date)
          let title = ''

          if (block.full_day) {
            title = 'BLOQUEADO'
          } else {
            const start = new Date(block.start_time)
            const end = new Date(block.end_time)

            if (group.length === 1) {
              title = `Bloqueo ${start.getHours()} h - ${end.getHours()} h`
            } else if (idx === 0) {
              title = `Desde ${start.getHours()} h`
            } else if (idx === group.length - 1) {
              title = `Hasta ${end.getHours()} h`
            }
          }

          events.push({
            id: `block-${block.id}`,
            title,
            start: date.toISOString().split('T')[0],
            backgroundColor: '#dc2626',
            borderColor: '#dc2626',
            textColor: 'white',
            extendedProps: { type: 'block', data: block }
          })
        })
      })
    }

    setCalendarEvents(events)
  }

  useEffect(() => {
    if (role === 'ADMIN') loadCalendarData()
  }, [role])

  const handleDateClick = (arg) => {
    const fecha = new Date(arg.dateStr)
    if (fecha.getDay() === 0 || fecha.getDay() === 6 || isBefore(fecha, hoy)) {
      alert('No se puede seleccionar sábados, domingos o días pasados.')
      return
    }

    if (role === 'ADMIN') {
      setEditingBlock(null)
      reset({
        start_date: arg.dateStr,
        end_date: arg.dateStr,
        full_day: false,
        start_time: '',
        end_time: '',
        reason: ''
      })
      setIsModalOpen(true)
    } else {
      navigate(`/availability/${fecha.toISOString()}`)
    }
  }

  const [selectedBlock, setSelectedBlock] = useState(null)
  const [showBlockActions, setShowBlockActions] = useState(false)

  const handleEventClick = (clickInfo) => {
    const { type, data } = clickInfo.event.extendedProps
    if (type === 'block') {
      setSelectedBlock(data)
      setShowBlockActions(true)
    }
  }

  const handleEditBlock = (block) => {
    setEditingBlock(block)
    const date = new Date(block.date)
    const dateStr = date.toISOString().split('T')[0]
    const formData = {
      start_date: dateStr,
      end_date: '',
      full_day: block.full_day,
      reason: block.reason || ''
    }

    if (!block.full_day && block.start_time && block.end_time) {
      const start = new Date(block.start_time)
      const end = new Date(block.end_time)
      formData.start_time = String(start.getHours()).padStart(2, '0') + ":00"
      formData.end_time = String(end.getHours()).padStart(2, '0') + ":00"
    }

    reset(formData)
    setIsModalOpen(true)
  }

  const handleDeleteBlock = async () => {
    if (!selectedBlock) return
    const res = await deleteBlock(selectedBlock.id)
    if (res.error) {
      setToast({ message: res.error, type: "error" })
      return
    }
    setToast({ message: "Bloqueo eliminado correctamente", type: "success" })
    setShowBlockActions(false)
    setSelectedBlock(null)
    loadCalendarData()
  }

  const handleEditBlockClick = () => {
    if (!selectedBlock) return
    handleEditBlock(selectedBlock)
    setShowBlockActions(false)
    setSelectedBlock(null)
  }

  const onSubmit = async (data) => {
    const payload = {
      date: data.start_date,
      full_day: data.full_day,
      reason: data.reason || null
    }

    if (data.end_date && data.end_date !== data.start_date)
      payload.end_date = data.end_date

    if (!data.full_day) {
      const dateStr = data.start_date
      payload.start_time = new Date(`${dateStr}T${data.start_time}:00`).toISOString()
      payload.end_time = new Date(`${dateStr}T${data.end_time}:00`).toISOString()
    }

    const res = editingBlock
      ? await updateBlock(editingBlock.id, payload)
      : await createBlock(payload)

    if (res.error) {
      setToast({ message: res.error, type: "error" })
      return
    }

    setToast({ message: res.message || "Bloqueo guardado correctamente", type: "success" })
    setIsModalOpen(false)
    setEditingBlock(null)
    reset()
    loadCalendarData()
  }

  return (
    <>
      <div className="max-w-5xl mx-auto mt-6 p-4 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-[#009BA6] mb-4 text-center">
          {role === 'ADMIN' ? 'Calendario de Gestión' : 'Calendario de Disponibilidad'}
        </h2>

        {role === 'ADMIN' && (
          <p className="text-gray-600 text-sm text-center mb-4">
            Haz clic en un día para crear un bloqueo. Haz clic en un bloqueo existente para editarlo o eliminarlo.
          </p>
        )}

        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          weekends={false}
          events={calendarEvents}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          headerToolbar={{ left: 'prev', center: 'title', right: 'next' }}
          locale={esLocale}
          height="auto"
          eventDisplay="block"
        />
      </div>

      {/* Modal de acciones del bloqueo */}
      {role === 'ADMIN' && showBlockActions && selectedBlock && (
        <Modal
          isOpen={showBlockActions}
          onClose={() => { setShowBlockActions(false); setSelectedBlock(null) }}
          title="Opciones del Bloqueo"
        >
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">
                <strong>Fecha:</strong> {new Date(selectedBlock.date).toLocaleDateString('es-ES')}
              </p>
              {!selectedBlock.full_day && selectedBlock.start_time && selectedBlock.end_time && (
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Horario:</strong> {new Date(selectedBlock.start_time).getHours()} h - {new Date(selectedBlock.end_time).getHours()} h
                </p>
              )}
              {selectedBlock.full_day && (
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Tipo:</strong> Día completo
                </p>
              )}
              {selectedBlock.reason && (
                <p className="text-sm text-gray-600">
                  <strong>Motivo:</strong> {selectedBlock.reason}
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={handleEditBlockClick} className="flex-1 px-4 py-2 bg-[#009BA6] text-white rounded-lg hover:bg-[#007a82] transition">Editar</button>
              <button onClick={handleDeleteBlock} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Eliminar</button>
            </div>

            <button onClick={() => { setShowBlockActions(false); setSelectedBlock(null) }} className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">Cancelar</button>
          </div>
        </Modal>
      )}

      {/* Modal de creación / edición */}
      {role === 'ADMIN' && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setEditingBlock(null) }}
          title={editingBlock ? "Editar Bloqueo" : "Crear Bloqueo"}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de inicio *</label>
              <input {...register("start_date")} type="date" disabled={!!editingBlock} min={hoy.toISOString().split('T')[0]} className="w-full px-3 py-2 border rounded-lg" />
              {errors.start_date && <p className="text-red-500 text-sm mt-1">{errors.start_date.message}</p>}
            </div>

            {!editingBlock && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de fin (opcional)</label>
                <input {...register("end_date")} type="date" min={watch("start_date") || hoy.toISOString().split('T')[0]} className="w-full px-3 py-2 border rounded-lg" />
              </div>
            )}

            <div className="flex items-center">
              <input {...register("full_day")} type="checkbox" className="mr-2 w-4 h-4" />
              <label className="text-sm font-medium text-gray-700">Bloquear día(s) completo(s)</label>
            </div>

            {!fullDay && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-1">
                    Hora de inicio *
                  </label>
                  <select
                    {...register("start_time")}
                    id="start_time"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009BA6] border-gray-300"
                  >
                    <option value="">Selecciona hora</option>
                    {[...Array(14)].map((_, i) => {
                      const hour = i + 8 // de 8 a 21
                      const label = `${hour}:00`
                      return <option key={hour} value={label}>{hour} h</option>
                    })}
                  </select>
                  {errors.start_time && (
                    <p className="text-red-500 text-sm mt-1">{errors.start_time.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-1">
                    Hora de fin *
                  </label>
                  <select
                    {...register("end_time")}
                    id="end_time"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009BA6] border-gray-300"
                  >
                    <option value="">Selecciona hora</option>
                    {[...Array(14)].map((_, i) => {
                      const hour = i + 9
                      const label = `${hour}:00`
                      return <option key={hour} value={label}>{hour} h</option>
                    })}
                  </select>
                  {errors.end_time && (
                    <p className="text-red-500 text-sm mt-1">{errors.end_time.message}</p>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Motivo (opcional)</label>
              <textarea {...register("reason")} rows="3" className="w-full px-3 py-2 border rounded-lg" placeholder="Ej: Vacaciones, festivo..." />
            </div>

            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => { reset(); setIsModalOpen(false); setEditingBlock(null) }} className="flex-1 px-4 py-2 border rounded-lg">Cancelar</button>
              <button type="submit" className="flex-1 px-4 py-2 bg-[#009BA6] text-white rounded-lg hover:bg-[#007a82] transition">{editingBlock ? 'Actualizar' : 'Crear'}</button>
            </div>
          </form>
        </Modal>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  )
}
