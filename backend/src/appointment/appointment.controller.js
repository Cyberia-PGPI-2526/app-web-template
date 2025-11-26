import { SessionType } from "@prisma/client"
import { prisma } from "../config/db.js"

export async function getMyAppointments(req, res) {
    try {
        const userId = req.user.userId
        let { page = 1, limit = 10 } = req.query
        page = parseInt(page)
        limit = parseInt(limit)
        const skip = (page - 1) * limit

        const [appointments, total] = await Promise.all([
            prisma.appointment.findMany({
                where: { clientId: userId },
                skip,
                take: limit,
                include: {
                    client: {
                        select: { id: true, name: true, email: true }
                    },
                    service: {
                        select: { id: true, name: true }
                    }
                },
                orderBy: {
                    appointment_date: 'desc'
                }
            }),
            prisma.appointment.count({ where: { clientId: userId } })
        ])

        return res.json({
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            appointments
        })
    } catch (error) {
        return res.status(500).json({ message: "Server error" })
    }
}

export async function getAppointments(req, res) {
    try {
        let { page = 1, limit = 10, clientId, state } = req.query
        page = parseInt(page)
        limit = parseInt(limit)
        const skip = (page - 1) * limit

        const where = {}
        if (clientId) {
            where.clientId = parseInt(clientId)
        }
        if (state) {
            where.state = state.toUpperCase()
        }

        const [appointments, total] = await Promise.all([
            prisma.appointment.findMany({
                where,
                skip,
                take: limit,
                include: {
                    client: {
                        select: { id: true, name: true, email: true }
                    },
                    service: {
                        select: { id: true, name: true }
                    }
                },
                orderBy: {
                    appointment_date: 'desc'
                }
            }),
            prisma.appointment.count({ where })
        ])

        return res.json({
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            appointments
        })
    } catch (error) {
        return res.status(500).json({ message: "Server error" })
    }
}

export async function getAppointment(req, res) {
    try {
        const appointmentId = parseInt(req.params.id)
        const loggedInUserId = req.user.userId
        const loggedInUserRole = req.user.role

        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: {
                client: {
                    select: { id: true, name: true, email: true, phone_number: true }
                },
                service: true
            }
        })

        if (!appointment) return res.status(404).json({ message: "Appointment not found" })

        if (loggedInUserRole !== 'ADMIN' && appointment.clientId !== loggedInUserId) {
            return res.status(403).json({ message: "Access denied. You can only view your own appointments." })
        }

        return res.json(appointment)
    } catch (error) {
        return res.status(500).json({ message: "Server error getting appointment" })
    }
}

export async function createAppointment(req, res) {
  try {
    const userId = req.user.userId
    const { appointment_date, start_time, end_time, serviceId } = req.body

    const newAppointment = await prisma.appointment.create({
      data: {
        appointment_date: new Date(appointment_date),
        start_time: new Date(start_time),
        end_time: new Date(end_time),
        clientId: userId,
        serviceId: parseInt(serviceId),
        session_type: "MIN_60"
      }
    })

    return res.status(201).json(newAppointment)
  } catch (error) {
    return res.status(500).json({ message: "Error del servidor al crear la cita" })
  }
}


export async function updateAppointment(req, res) {
  try {
    const appointmentId = parseInt(req.params.id)
    const loggedInUserId = req.user.userId
    const loggedInUserRole = req.user.role
    const { appointment_date, start_time, end_time, serviceId, state } = req.body

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId }
    })

    if (!appointment)
      return res.status(404).json({ message: "Cita no encontrada" })

    if (loggedInUserRole !== 'ADMIN' && appointment.clientId !== loggedInUserId) {
      return res.status(403).json({ message: "Acceso denegado. Solo puedes actualizar tus propias citas." })
    }

    const dataToUpdate = {}

    if (appointment_date) dataToUpdate.appointment_date = new Date(appointment_date)
    if (start_time) dataToUpdate.start_time = new Date(start_time)
    if (end_time) dataToUpdate.end_time = new Date(end_time)
    if (serviceId) dataToUpdate.serviceId = parseInt(serviceId)

    if (state) {
      if (loggedInUserRole === 'ADMIN') {
        dataToUpdate.state = state.toUpperCase()
      } else {
        return res.status(403).json({ message: "Acceso denegado. Solo los administradores pueden cambiar el estado de la cita." })
      }
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return res.status(400).json({ message: "No se proporcionaron campos para actualizar" })
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: dataToUpdate
    })

    return res.json({ message: "Cita actualizada correctamente", appointment: updatedAppointment })
  } catch (error) {
    return res.status(500).json({ message: "Error del servidor al actualizar la cita" })
  }
}



export async function deleteAppointment(req, res) {
    try {
        const appointmentId = parseInt(req.params.id)
        const loggedInUserRole = req.user.role

        if (loggedInUserRole !== 'ADMIN') {
            return res.status(403).json({ message: "Access denied. Only administrators can delete appointments." })
        }

        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId }
        })

        if (!appointment) return res.status(404).json({ message: "Appointment not found" })

        await prisma.appointment.delete({
            where: { id: appointmentId }
        })

        return res.json({ message: "Appointment deleted successfully" })
    } catch (error) {
        return res.status(500).json({ message: "Server error deleting appointment" })
    }
}

// Helpers y acciones específicas para ADMIN sobre el estado de la cita
async function setAppointmentState(req, res, newState) {
    try {
        const appointmentId = parseInt(req.params.id)

        const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } })
        if (!appointment) return res.status(404).json({ message: "Cita no encontrada" })

        const updated = await prisma.appointment.update({
            where: { id: appointmentId },
            data: { state: newState }
        })

        return res.json({ message: `Estado actualizado a ${newState}`, appointment: updated })
    } catch (error) {
        return res.status(500).json({ message: "Error del servidor al actualizar el estado" })
    }
}

export async function confirmAppointment(req, res) {
    return setAppointmentState(req, res, 'CONFIRMED')
}

export async function cancelAppointment(req, res) {
  return setAppointmentState(req, res, 'CANCELED')
}

export async function completeAppointment(req, res) {
    return setAppointmentState(req, res, 'COMPLETED')
}

export async function markNotAssisted(req, res) {
    return setAppointmentState(req, res, 'NOT_ASSISTED')
}