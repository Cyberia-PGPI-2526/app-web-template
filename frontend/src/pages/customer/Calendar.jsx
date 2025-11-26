import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import esLocale from '@fullcalendar/core/locales/es'
import { startOfDay, isBefore } from 'date-fns'
import { getBlockedSlots } from '../../service/availability.service'

export default function CalendarioDisponibilidad() {
  const navigate = useNavigate()
  const hoy = startOfDay(new Date())
  const [calendarEvents, setCalendarEvents] = useState([])
  const [blockedDates, setBlockedDates] = useState(new Set())
  const [partialBlockedDates, setPartialBlockedDates] = useState(new Set())

  useEffect(() => {
    loadBlocks()
  }, [])

  const loadBlocks = async () => {
    const data = await getBlockedSlots()
    
    const events = []
    const blockedDatesSet = new Set()
    const partialBlockedDatesSet = new Set()
    
    if (data.blockedSlots) {
      data.blockedSlots.forEach(block => {
        const date = new Date(block.date)
        const dateStr = date.toISOString().split('T')[0]
        
        if (block.full_day) {
          blockedDatesSet.add(dateStr)
        } else {
          partialBlockedDatesSet.add(dateStr)
        }
        
        let title = ''
        let description = ''
        
        if (block.full_day) {
          title = '🚫 Día bloqueado'
          description = block.reason || 'No disponible'
        } else {
          const start = new Date(block.start_time)
          const end = new Date(block.end_time)
          title = `🚫 ${start.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`
          description = block.reason || 'Bloqueado'
        }
        
        events.push({
          id: `block-${block.id}`,
          title,
          start: dateStr,
          backgroundColor: '#dc2626',
          borderColor: '#dc2626',
          textColor: 'white',
          classNames: block.full_day ? ['cursor-not-allowed'] : ['cursor-pointer'],
          extendedProps: {
            type: 'block',
            reason: block.reason,
            full_day: block.full_day,
            description
          }
        })
      })
    }
    
    setCalendarEvents(events)
    setBlockedDates(blockedDatesSet)
    setPartialBlockedDates(partialBlockedDatesSet)
  }

  const handleDateClick = (arg) => {
    const fecha = new Date(arg.dateStr)

    if (fecha.getDay() === 0 || fecha.getDay() === 6 || isBefore(fecha, hoy)) {
      alert('No se puede seleccionar sábados, domingos o días pasados.')
      return
    }

    if (blockedDates.has(arg.dateStr)) {
      alert('Este día está completamente bloqueado y no está disponible para reservas.')
      return
    }

    navigate(`/availability/${fecha.toISOString()}`)
  }

  return (
    <div className="max-w-5xl mx-auto mt-6 p-4 bg-white rounded-xl shadow-lg">
      <style>{`
        /* Permitir que eventos no interfieran con clics en la celda */
        .fc-event.cursor-pointer,
        .fc-event.cursor-not-allowed {
          pointer-events: none !important;
        }
        
        /* CELDA DE DÍA BLOQUEADO COMPLETAMENTE - cursor pointer (mano) */
        .fc-daygrid-day-frame.blocked-full-day,
        .fc-daygrid-day.blocked-full-day,
        .fc-daygrid-day.blocked-full-day .fc-daygrid-day-frame,
        .fc-daygrid-day.blocked-full-day .fc-daygrid-day-top,
        .fc-daygrid-day.blocked-full-day .fc-daygrid-day-events,
        .fc-daygrid-day.blocked-full-day .fc-daygrid-day-bg,
        .fc-daygrid-day.blocked-full-day * {
          cursor: pointer !important;
        }
        
        /* CELDA DE DÍA CON BLOQUEO PARCIAL - cursor prohibido */
        .fc-daygrid-day-frame.blocked-partial,
        .fc-daygrid-day.blocked-partial,
        .fc-daygrid-day.blocked-partial .fc-daygrid-day-frame,
        .fc-daygrid-day.blocked-partial .fc-daygrid-day-top,
        .fc-daygrid-day.blocked-partial .fc-daygrid-day-events,
        .fc-daygrid-day.blocked-partial .fc-daygrid-day-bg,
        .fc-daygrid-day.blocked-partial * {
          cursor: not-allowed !important;
        }
        
        /* CELDA DE DÍA DISPONIBLE - cursor pointer (mano) */
        .fc-daygrid-day-frame.available-day,
        .fc-daygrid-day.available-day,
        .fc-daygrid-day.available-day .fc-daygrid-day-frame,
        .fc-daygrid-day.available-day .fc-daygrid-day-top,
        .fc-daygrid-day.available-day .fc-daygrid-day-events,
        .fc-daygrid-day.available-day .fc-daygrid-day-bg,
        .fc-daygrid-day.available-day * {
          cursor: pointer !important;
        }
      `}</style>
      
      <h2 className="text-2xl font-bold text-[#009BA6] mb-4 text-center">
        Calendario de Disponibilidad
      </h2>
      <p className="text-gray-600 text-sm text-center mb-4">
        Selecciona un día para ver las horas disponibles. Los días en rojo están bloqueados.
      </p>

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        weekends={false}
        events={calendarEvents}
        dateClick={handleDateClick}
        headerToolbar={{
          left: 'prev',
          center: 'title',
          right: 'next',
        }}
        locale={esLocale}
        buttonText={{
          prev: 'Anterior',
          next: 'Siguiente',
          today: 'Hoy',
          month: 'Mes',
        }}
        height="auto"
        eventDisplay="block"
        dayCellDidMount={(arg) => {
          const fecha = new Date(arg.date)
          const isPast = isBefore(fecha, hoy)
          const dateStr = fecha.toISOString().split('T')[0]
          const isFullBlocked = blockedDates.has(dateStr)
          const isPartialBlocked = partialBlockedDates.has(dateStr)
          
          if (!isPast) {
            const allChildren = arg.el.querySelectorAll('*')
            
            if (isFullBlocked) {
              arg.el.classList.add('blocked-full-day')
              arg.el.style.cursor = 'pointer'
              allChildren.forEach(child => {
                child.style.cursor = 'pointer'
              })
            } else if (isPartialBlocked) {
              arg.el.classList.add('blocked-partial')
              arg.el.style.cursor = 'not-allowed'
              allChildren.forEach(child => {
                child.style.cursor = 'not-allowed'
              })
            } else {
              arg.el.classList.add('available-day')
              arg.el.style.cursor = 'pointer'
              allChildren.forEach(child => {
                child.style.cursor = 'pointer'
              })
            }
          }
        }}
        dayCellClassNames={(arg) => {
          const fecha = new Date(arg.date)
          const isPast = isBefore(fecha, hoy)
          const dateStr = fecha.toISOString().split('T')[0]
          const isFullBlocked = blockedDates.has(dateStr)
          const isPartialBlocked = partialBlockedDates.has(dateStr)
          
          if (isPast) {
            return 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }
          if (isFullBlocked) {
            return 'bg-red-50'
          }
          if (isPartialBlocked) {
            return 'hover:bg-gray-50 transition'
          }
          return 'hover:bg-gray-50 transition'
        }}
      />
    </div>
  )
}
