import { prisma } from "../config/db.js"
import bcrypt from "bcrypt"

export async function getProfile(req, res) {
  try {
    const userId = req.user.userId

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
      }
    })

    if (!user) return res.status(404).json({ message: "User not found" })

    return res.json(user)
  } catch (error) {
    return res.status(500).json({ message: "Server error" })
  }
}

export async function editProfile(req, res) {
  try {
    const userId = req.user.userId
    const { name, email, password, phoneNumber } = req.body

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    const dataToUpdate = {
      name: user.name
    }

    if (name && name.trim() !== user.name) {
      dataToUpdate.name = name.trim()
    }

    if (email && email.trim() !== user.email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email: email.trim() },
      })

      if (existingEmail) {
        return res.status(400).json({ message: "Email already in use" })
      }

      dataToUpdate.email = email.trim()
    }

    if (phoneNumber && phoneNumber.trim() !== user.phone_number) {
      dataToUpdate.phone_number = phoneNumber.trim()
    }

    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10)
      dataToUpdate.password = hashedPassword
    }

    await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
    })

    return res.json({ message: "Profile updated successfully" })
  } catch (error) {
    return res.status(500).json({ message: "Server error" })
  }
}


export async function getUsers(req, res) {
  try {
    let { page = 1, limit = 10 } = req.query
    page = parseInt(page)
    limit = parseInt(limit)
    const skip = (page - 1) * limit

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        select: { id: true, name: true, email: true, role: true }
      }),
      prisma.user.count()
    ])

    return res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      users
    })
  } catch (error) {
    return res.status(500).json({ message: "Server error" })
  }
}

export async function getUser(req, res) {
  try {
    const userId = req.params.id

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        name: true,
        email: true,
        phone_number: true,
        role: true
      }
    })

    if (!user) return res.status(404).json({ message: "User not found" })

    return res.json(user)
  } catch (error) {
    return res.status(500).json({ message: "Server error" })
  }
}

export async function updateUser(req, res) {
  try {
    const userId = parseInt(req.params.id)
    const { name, email, phoneNumber, password, role } = req.body

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) return res.status(404).json({ message: "User not found" })

    const dataToUpdate = {
      name: user.name
    }

    if (name && name.trim() !== user.name) {
      dataToUpdate.name = name.trim()
    }

    if (role && role !== user.role) {
      dataToUpdate.role = role
    }

    if (email && email.trim() !== user.email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email: email.trim() }
      })

      if (existingEmail) {
        return res.status(400).json({ message: "Email in use" })
      }

      dataToUpdate.email = email.trim()
    }

    if (phoneNumber && phoneNumber.trim() !== user.phone_number) {
      dataToUpdate.phone_number = phoneNumber.trim()
    }

    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10)
      dataToUpdate.password = hashedPassword
    }

    await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate
    })

    return res.json({ message: "Updated successfully" })
  } catch (error) {
    return res.status(500).json({ message: "Server error" })
  }
}

export async function deleteUser(req, res) {
  try {
    const userId = req.params.id

    const existingAppointments = await prisma.appointment.findMany({
      where: { clientId: parseInt(userId) }
    });

    if (existingAppointments.length > 0) {
      return res.status(400).json({ message: "User has associated appointments" });
    }

    if (parseInt(userId) === req.user.userId) return res.status(400).json({ message: "Can't delete" })

    await prisma.refreshToken.deleteMany({
      where: { userId: parseInt(userId) }
    })

    await prisma.user.delete({
      where: { id: parseInt(userId) }
    })

    return res.json({ message: "Deleted succesfully" })
  } catch (error) {
    return res.status(500).json({ message: "Server error" })
  }
}