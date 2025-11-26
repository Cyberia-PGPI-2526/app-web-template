import { prisma } from "../config/db.js"
import { addMinutes, isBefore, format, startOfDay, endOfDay } from "date-fns"

export async function getAvailableHours(req, res) {
  try {
    const { date } = req.params
    const selectedDate = new Date(date + "T00:00:00")

    const workRanges = [
      { start: 10, end: 14 },
      { start: 17, end: 22 }
    ]

    const sessionMinutes = 60

    const appointments = await prisma.appointment.findMany({
      where: {
        appointment_date: {
          gte: startOfDay(selectedDate),
          lte: endOfDay(selectedDate)
        },
        state: { notIn: ["CANCELED", "NOT_ASSISTED"] }
      },
      select: { start_time: true, end_time: true }
    })

    const blockedSlots = await prisma.blockedSlot.findMany({
      where: {
        date: {
          gte: startOfDay(selectedDate),
          lte: endOfDay(selectedDate)
        }
      }
    })

    if (blockedSlots.some(b => b.full_day)) {
      return res.json({ date, availableHours: [] })
    }

    const allHours = []
    for (const range of workRanges) {
      let time = new Date(selectedDate)
      time.setHours(range.start, 0, 0, 0)

      while (time.getHours() < range.end) {
        const end = addMinutes(time, sessionMinutes)
        allHours.push({ start: new Date(time), end })
        time = end
      }
    }

    let available = allHours.filter(slot =>
      !appointments.some(a =>
        slot.start < a.end_time && slot.end > a.start_time
      )
    )

    available = available.filter(slot =>
      !blockedSlots.some(b =>
        b.start_time && b.end_time &&
        slot.start < b.end_time && slot.end > b.start_time
      )
    )

    const availableHours = available.map(slot =>
      format(slot.start, "HH:mm")
    )

    return res.json({ date, availableHours })
  } catch (error) {
    return res.status(500).json({ error: "Error al obtener disponibilidad" })
  }
}


export async function createBlock(req, res) {
  const { date, start_time, end_time, full_day, reason, end_date } = req.body
  try {
    // Si tiene end_date, es un bloqueo de periodo (varios días)
    if (end_date) {
      const startDate = new Date(date + "T00:00:00Z")
      const endDateObj = new Date(end_date + "T00:00:00Z")
      
      if (endDateObj < startDate) {
        return res.status(400).json({ error: "La fecha de fin no puede ser anterior a la fecha de inicio" })
      }

      // Verificar que no haya citas en todo el periodo
      const conflictingAppointments = await prisma.appointment.findFirst({
        where: {
          appointment_date: {
            gte: startDate,
            lte: endDateObj
          },
          state: { notIn: ["CANCELED", "NOT_ASSISTED"] },
          ...(full_day ? {} : {
            OR: [
              {
                AND: [
                  { start_time: { lt: new Date(end_time) } },
                  { end_time: { gt: new Date(start_time) } }
                ]
              }
            ]
          })
        }
      })

      if (conflictingAppointments) {
        return res.status(409).json({ error: "Existen citas programadas en el periodo seleccionado" })
      }

      // Verificar bloqueos superpuestos
      const conflictingBlocks = await prisma.blockedSlot.findFirst({
        where: {
          date: {
            gte: startDate,
            lte: endDateObj
          },
          OR: [
            { full_day: true },
            ...(full_day ? [{ full_day: false }] : [{
              AND: [
                { start_time: { lt: new Date(end_time) } },
                { end_time: { gt: new Date(start_time) } }
              ]
            }])
          ]
        }
      })

      if (conflictingBlocks) {
        return res.status(409).json({ error: "Ya existe un bloqueo en el periodo seleccionado" })
      }

      // Crear bloqueo para cada día del periodo
      const blocks = []
      let currentDate = new Date(startDate)
      
      while (currentDate <= endDateObj) {
        const block = await prisma.blockedSlot.create({
          data: {
            date: new Date(currentDate),
            start_time: full_day ? null : new Date(start_time),
            end_time: full_day ? null : new Date(end_time),
            full_day: full_day || false,
            reason
          }
        })
        blocks.push(block)
        currentDate.setDate(currentDate.getDate() + 1)
      }

      return res.json({ message: `${blocks.length} bloqueos creados`, blocks })
    }

    // Lógica original para un solo día
    const selectedDate = new Date(date + "T00:00:00Z")

    const existingFullDayBlock = await prisma.blockedSlot.findFirst({
      where: { date: selectedDate, full_day: true }
    })
    if (existingFullDayBlock) {
      return res.status(400).json({ error: "Este día ya está completamente bloqueado" })
    }

    if (full_day) {
      // Verificar que no haya citas ese día
      const conflictingAppointments = await prisma.appointment.findFirst({
        where: {
          appointment_date: selectedDate,
          state: { notIn: ["CANCELED", "NOT_ASSISTED"] }
        }
      })

      if (conflictingAppointments) {
        return res.status(409).json({ error: "Existen citas programadas en ese día" })
      }

      // Verificar bloqueos existentes
      const existingBlocks = await prisma.blockedSlot.findFirst({
        where: { date: selectedDate }
      })

      if (existingBlocks) {
        return res.status(409).json({ error: "Ya existe un bloqueo en este día" })
      }

      const block = await prisma.blockedSlot.create({
        data: {
          date: selectedDate,
          start_time: null,
          end_time: null,
          full_day: true,
          reason
        }
      })
      return res.json(block)
    }

    // Verificar citas en el horario específico
    const conflictingAppointments = await prisma.appointment.findFirst({
      where: {
        appointment_date: selectedDate,
        state: { notIn: ["CANCELED", "NOT_ASSISTED"] },
        OR: [
          {
            AND: [
              { start_time: { lt: new Date(end_time) } },
              { end_time: { gt: new Date(start_time) } }
            ]
          }
        ]
      }
    })

    if (conflictingAppointments) {
      return res.status(409).json({ error: "Existen citas en ese horario" })
    }

    // Verificar bloqueos superpuestos en el horario
    const overlappingBlock = await prisma.blockedSlot.findFirst({
      where: {
        date: selectedDate,
        OR: [
          { full_day: true },
          {
            AND: [
              { start_time: { lt: new Date(end_time) } },
              { end_time: { gt: new Date(start_time) } }
            ]
          }
        ]
      }
    })

    if (overlappingBlock) {
      return res.status(409).json({ error: "Ya existe un bloqueo en ese horario" })
    }

    const block = await prisma.blockedSlot.create({
      data: {
        date: selectedDate,
        start_time: new Date(start_time),
        end_time: new Date(end_time),
        full_day: false,
        reason
      }
    })

    res.json(block)
  } catch (e) {
    res.status(500).json({ error: "Error al crear bloqueo" })
  }
}

export async function deleteBlock(req, res) {
  try {
    const { id } = req.params
    await prisma.blockedSlot.delete({
      where: { id: parseInt(id) }
    })
    res.json({ message: "Bloqueo eliminado correctamente" })
  } catch (e) {
    res.status(500).json({ error: "Error al eliminar bloqueo" })
  }
}

export async function getCalendarData(req, res) {
  try {
    // Obtener todas las citas confirmadas
    const appointments = await prisma.appointment.findMany({
      where: {
        state: "CONFIRMED"
      },
      select: {
        id: true,
        appointment_date: true,
        start_time: true,
        end_time: true,
        client: {
          select: { name: true, email: true }
        },
        service: {
          select: { name: true }
        }
      }
    })

    // Obtener todos los bloqueos
    const blockedSlots = await prisma.blockedSlot.findMany({
      orderBy: { date: 'asc' }
    })

    return res.json({ appointments, blockedSlots })
  } catch (error) {
    return res.status(500).json({ error: "Error obteniendo datos del calendario" })
  }
}

export async function getBlockedSlots(req, res) {
  try {
    // Obtener todos los bloqueos (para customers)
    const blockedSlots = await prisma.blockedSlot.findMany({
      orderBy: { date: 'asc' }
    })

    return res.json({ blockedSlots })
  } catch (error) {
    return res.status(500).json({ error: "Error obteniendo bloqueos" })
  }
}

export async function updateBlock(req, res) {
  try {
    const { id } = req.params
    const { date, start_time, end_time, full_day, reason } = req.body

    const existingBlock = await prisma.blockedSlot.findUnique({
      where: { id: parseInt(id) }
    })

    if (!existingBlock) {
      return res.status(404).json({ error: "Bloqueo no encontrado" })
    }

    const selectedDate = new Date(date + "T00:00:00Z")

    // Si cambia a full_day, verificar que no haya citas ese día
    if (full_day) {
      const conflictingAppointments = await prisma.appointment.findFirst({
        where: {
          appointment_date: selectedDate,
          state: { notIn: ["CANCELED", "NOT_ASSISTED"] }
        }
      })

      if (conflictingAppointments) {
        return res.status(409).json({ error: "Existen citas programadas en ese día" })
      }

      // Verificar que no haya otros bloqueos en ese día
      const otherBlocks = await prisma.blockedSlot.findFirst({
        where: {
          date: selectedDate,
          id: { not: parseInt(id) }
        }
      })

      if (otherBlocks) {
        return res.status(409).json({ error: "Ya existe otro bloqueo en ese día" })
      }

      const updated = await prisma.blockedSlot.update({
        where: { id: parseInt(id) },
        data: {
          date: selectedDate,
          start_time: null,
          end_time: null,
          full_day: true,
          reason
        }
      })
      return res.json(updated)
    }

    // Verificar citas en el horario específico
    const conflictingAppointments = await prisma.appointment.findFirst({
      where: {
        appointment_date: selectedDate,
        state: { notIn: ["CANCELED", "NOT_ASSISTED"] },
        OR: [
          {
            AND: [
              { start_time: { lt: new Date(end_time) } },
              { end_time: { gt: new Date(start_time) } }
            ]
          }
        ]
      }
    })

    if (conflictingAppointments) {
      return res.status(409).json({ error: "Existen citas en ese horario" })
    }

    // Verificar bloqueos superpuestos (excluyendo el actual)
    const overlappingBlock = await prisma.blockedSlot.findFirst({
      where: {
        date: selectedDate,
        id: { not: parseInt(id) },
        OR: [
          { full_day: true },
          {
            AND: [
              { start_time: { lt: new Date(end_time) } },
              { end_time: { gt: new Date(start_time) } }
            ]
          }
        ]
      }
    })

    if (overlappingBlock) {
      return res.status(409).json({ error: "Ya existe un bloqueo en ese horario" })
    }

    if (conflictingAppointments) {
      return res.status(409).json({ error: "Existen citas en ese horario" })
    }

    const updated = await prisma.blockedSlot.update({
      where: { id: parseInt(id) },
      data: {
        date: selectedDate,
        start_time: new Date(start_time),
        end_time: new Date(end_time),
        full_day: false,
        reason
      }
    })

    res.json(updated)
  } catch (e) {
    res.status(500).json({ error: "Error al actualizar bloqueo" })
  }
}
