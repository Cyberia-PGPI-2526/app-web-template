import express from "express"
import { checkRole, requiresAuth } from "../auth/auth.middleware.js"
import { getAvailableHours, createBlock, deleteBlock, getCalendarData, updateBlock, getBlockedSlots } from "./availability.controller.js"

export const availabilityRouter = express.Router()

// Rutas específicas PRIMERO (antes de /:date)
availabilityRouter.get("/calendar/data",
    requiresAuth,
    checkRole("ADMIN"),
    getCalendarData
)

availabilityRouter.get("/blocks",
    requiresAuth,
    getBlockedSlots
)

availabilityRouter.post("/block",
    requiresAuth,
    checkRole("ADMIN"),
    createBlock)

availabilityRouter.put("/block/:id",
    requiresAuth,
    checkRole("ADMIN"),
    updateBlock)

availabilityRouter.delete("/block/:id",
    requiresAuth,
    checkRole("ADMIN"),
    deleteBlock)

// Ruta con parámetro AL FINAL
availabilityRouter.get("/:date",
    requiresAuth,
    getAvailableHours
)
