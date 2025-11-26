import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { prisma } from "../config/db.js"
import { ENV, SECRET_KEY } from "../config/env.js"
import { Role } from "@prisma/client"

const isProd = ENV === "production"

export async function registerUser(req, res) {
    try {
        const { name, email, phone_number, password } = req.body

        const user = await prisma.user.findUnique({
            where: {
                email
            }
        })

        if (user) return res.status(400).json({ message: 'Email in use' })

        const hashedPassword = await bcrypt.hash(password, 10)

        await prisma.user.create({
            data: {
                name,
                email,
                phone_number,
                password: hashedPassword,
                role: Role.CUSTOMER
            }
        })

        return res.status(201).json({ message: 'User created' })
    } catch (error) {
        return res.status(500).json({ message: 'Server error' })
    }
}

export async function loginUser(req, res) {
    try {
        const { email, password } = req.body

        const user = await prisma.user.findUnique({
            where: {
                email
            }
        })

        if (!user) return res.status(404).json({ message: 'User not found' })

        const validPassword = await bcrypt.compare(password, user.password)

        if (!validPassword) return res.status(400).json({ message: 'Bad credentials' })

        const accessToken = jwt.sign({ userId: user.id, role: user.role }, SECRET_KEY, { expiresIn: "15m" })

        const refreshToken = jwt.sign({ userId: user.id, role: user.role }, SECRET_KEY, { expiresIn: "15d" })

        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10)

        await prisma.refreshToken.upsert({
            where: { userId: user.id },
            update: {
                token: hashedRefreshToken,
                expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
            },
            create: {
                token: hashedRefreshToken,
                expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
                userId: user.id,
            }
        })


        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: "none",
            maxAge: 15 * 24 * 60 * 60 * 1000
        })

        return res.json({ message: 'Login succesfully', token: accessToken, userId: user.id, role: user.role })
    } catch (error) {
        return res.status(500).json({ message: 'Server error' })
    }
}

export async function refreshToken(req, res) {
    try {
        const token = req.cookies?.refreshToken
        if (!token) return res.status(401).json({ message: "No refresh token provided" })

        const decoded = jwt.verify(token, SECRET_KEY)
        if (!decoded) return res.status(403).json({ message: "Invalid refresh token" })

        const user = await prisma.user.findUnique({ where: { id: decoded.userId } })
        if (!user) return res.status(404).json({ message: "User not found" })

        const dbToken = await prisma.refreshToken.findUnique({ where: { userId: user.id } })
        if (!dbToken) return res.status(403).json({ message: "Refresh token revoked" })

        const validToken = await bcrypt.compare(token, dbToken.token)
        if (!validToken || dbToken.expiresAt < new Date()) {
            await prisma.refreshToken.delete({ where: { userId: user.id } })
            return res.status(403).json({ message: "Refresh token revoked or expired" })
        }

        const accessToken = jwt.sign({ userId: user.id, role: user.role }, SECRET_KEY, { expiresIn: "15m" })
        const newRefreshToken = jwt.sign({ userId: user.id, role: user.role }, SECRET_KEY, { expiresIn: "15d" })
        const hashedNewRefreshToken = await bcrypt.hash(newRefreshToken, 10)

        await prisma.refreshToken.update({
            where: { userId: user.id },
            data: {
                token: hashedNewRefreshToken,
                expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
            }
        })

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: "none",
            maxAge: 15 * 24 * 60 * 60 * 1000
        })

        return res.json({ token: accessToken, userId: user.id, role: user.role })
    } catch (error) {
        return res.status(500).json({ message: "Server error" })
    }
}

export async function logoutUser(req, res) {
    try {
        const token = req.cookies?.refreshToken;
        if (token) {
            const decoded = jwt.verify(token, SECRET_KEY);
            await prisma.refreshToken.deleteMany({ where: { userId: decoded.userId } })
        }

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: isProd,
            sameSite: "none"
        })

        return res.json({ message: "Logged out successfully" })
    } catch (error) {
        return res.status(500).json({ message: "Server error" })
    }
}