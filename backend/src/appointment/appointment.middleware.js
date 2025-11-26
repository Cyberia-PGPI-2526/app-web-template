import { prisma } from "../config/db.js"
import { addMinutes } from "date-fns"

export async function checkAppointmentConflict(req, res, next) {
  try {
    const { start_time } = req.body
    const appointmentId = req.params.id ? parseInt(req.params.id) : null

    if (!start_time) {
      return res.status(400).json({ message: "Falta la hora de inicio" })
    }

    const newStartTime = new Date(start_time)
    const newEndTime = addMinutes(newStartTime, 59)

    const conflictQuery = {
      end_time: { gt: newStartTime },
      start_time: { lt: newEndTime },
    }

    if (appointmentId) {
      conflictQuery.id = { not: appointmentId }
    }

    const existingConflict = await prisma.appointment.findFirst({
      where: conflictQuery,
    })

    if (existingConflict) {
      return res.status(409).json({
        message: "Este horario se solapa con otra cita existente.",
      })
    }

    req.body.end_time = newEndTime

    next()
  } catch (error) {
    return res.status(500).json({
      message: "Error verificando conflictos de citas",
    })
  }
}

export async function checkBlockedSlot(req, res, next) {
  try {
    const { appointment_date, start_time, end_time } = req.body

    if (!appointment_date || !start_time || !end_time) {
      return res.status(400).json({ message: "Faltan datos de la cita" })
    }

    const selectedDate = new Date(appointment_date)
    selectedDate.setHours(0, 0, 0, 0)

    const start = new Date(start_time)
    const end = new Date(end_time)

    const blocked = await prisma.blockedSlot.findFirst({
      where: {
        date: selectedDate,
        OR: [
          { full_day: true },
          {
            AND: [
              { start_time: { lte: end } },
              { end_time: { gte: start } }
            ]
          }
        ]
      }
    })

    if (blocked) {
      return res.status(400).json({
        message: blocked.full_day
          ? "Este día está bloqueado por el administrador."
          : "Esta franja horaria está bloqueada por el administrador."
      })
    }

    next()
  } catch (error) {
    return res.status(500).json({ message: "Error verificando bloqueos del día o franja horaria" })
  }
}