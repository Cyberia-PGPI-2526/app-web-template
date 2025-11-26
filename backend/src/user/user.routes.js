import { Router } from "express"
import { deleteUser, getProfile, getUsers, updateUser, getUser, editProfile } from "./user.controller.js"
import { requiresAuth, checkRole } from "../auth/auth.middleware.js"
import { handleValidation } from "../utils/handleValidation.js"
import { updateUserValidation } from "./user.validation.js"

export const userRoutes = Router()

userRoutes.get("/", 
    requiresAuth,
    checkRole("ADMIN"),
    getUsers)

userRoutes.get("/:id", 
    requiresAuth,
    checkRole("ADMIN"),
    getUser)

userRoutes.put("/:id",
    requiresAuth,
    checkRole("ADMIN"),
    updateUserValidation,
    handleValidation,
    updateUser)

userRoutes.delete("/:id", 
    requiresAuth,
    checkRole("ADMIN"),
    deleteUser)

userRoutes.get("/me/profile", 
    requiresAuth,
    getProfile)

userRoutes.put("/me/profile", 
    requiresAuth,
    updateUserValidation,
    handleValidation,
    editProfile)