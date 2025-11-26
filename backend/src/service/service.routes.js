import { Router } from "express"
import { indexServices, indexEnabledServices, indexService, createService, updateService, deleteService } from "./service.controller.js"
import { requiresAuth, checkRole } from "../auth/auth.middleware.js"
import { handleValidation } from "../utils/handleValidation.js"
import { createServiceValidation, updateServiceValidation, idParamValidation } from "./service.validation.js"

export const serviceRoutes = Router()

serviceRoutes.get("/",
  indexEnabledServices
)

serviceRoutes.get("/all",
  requiresAuth,
  checkRole("ADMIN"),
  indexServices
)

serviceRoutes.get("/:id",
  requiresAuth,
  idParamValidation,
  handleValidation,
  indexService)

serviceRoutes.post(
  "/",
  requiresAuth,
  checkRole("ADMIN"),
  createServiceValidation,
  handleValidation,
  createService
)

serviceRoutes.put(
  "/:id",
  requiresAuth,
  checkRole("ADMIN"),
  updateServiceValidation,
  handleValidation,
  updateService
)

serviceRoutes.delete("/:id",
  requiresAuth,
  checkRole("ADMIN"),
  idParamValidation,
  handleValidation,
  deleteService
)
