import { prisma } from "../config/db.js"

export async function indexServices(req, res) {
  try {
    const services = await prisma.service.findMany({
      select: { id: true, name: true, description: true, disabled: true }
    })

    return res.json(services)
  } catch (error) {
    return res.status(500).json({ message: "Server error" })
  }
}

export async function indexEnabledServices(req, res) {
  try {
    const services = await prisma.service.findMany({
      where: { disabled: false },
      select: { id: true, name: true, description: true }
    })

    return res.json(services)
  } catch (error) {
    return res.status(500).json({ message: "Server error" })
  }
}

export async function indexService(req, res) {
  try {
    const id = parseInt(req.params.id)
    const service = await prisma.service.findUnique({
      where: { id },
      select: { id: true, name: true, description: true, disabled: true }
    })

    if (!service) return res.status(404).json({ message: "Service not found" })

    const userRole = req.user && req.user.role ? req.user.role : null
    if (service.disabled && userRole !== 'ADMIN') {
      return res.status(404).json({ message: "Service not found" })
    }

    return res.json(service)
  } catch (error) {
    return res.status(500).json({ message: "Server error" })
  }
}

export async function createService(req, res) {
  try {
    const { name, description, disabled } = req.body

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Name is required" })
    }

    const existing = await prisma.service.findUnique({ where: { name } })
    if (existing) return res.status(400).json({ message: "Service already exists" })

    await prisma.service.create({ data: { name: name.trim(), description, disabled: !!disabled } })

    return res.status(201).json({ message: "Service created" })
  } catch (error) {
    return res.status(500).json({ message: "Server error" })
  }
}

export async function updateService(req, res) {
  try {
    const id = parseInt(req.params.id)
    const { name, description, disabled } = req.body

    const service = await prisma.service.findUnique({ where: { id } })
    if (!service) return res.status(404).json({ message: "Service not found" })

    const dataToUpdate = {}
    if (name && name.trim() !== service.name) {
      const exists = await prisma.service.findUnique({ where: { name } })
      if (exists) return res.status(400).json({ message: "Name already in use" })
      dataToUpdate.name = name.trim()
    }

    if (description !== undefined) dataToUpdate.description = description
    if (disabled !== undefined) dataToUpdate.disabled = !!disabled

    await prisma.service.update({ where: { id }, data: dataToUpdate })

    return res.json({ message: "Service updated" })
  } catch (error) {
    return res.status(500).json({ message: "Server error" })
  }
}

export async function deleteService(req, res) {
  try {
    const id = parseInt(req.params.id)

    const service = await prisma.service.findUnique({ where: { id } })
    if (!service) return res.status(404).json({ message: "Service not found" })

    const hasAppointment = await prisma.appointment.findFirst({ where: { serviceId: id } })
    if (hasAppointment) {
      return res.status(400).json({ message: "Cannot delete service: there are appointments associated with it" })
    }

    await prisma.service.delete({ where: { id } })

    return res.json({ message: "Service deleted" })
  } catch (error) {
    return res.status(500).json({ message: "Server error" })
  }
}

export default { indexServices, indexEnabledServices, indexService, createService, updateService, deleteService }

