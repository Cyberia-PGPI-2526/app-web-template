import { check } from 'express-validator'
import { Role } from "@prisma/client"

export const updateUserValidation = [
    check('name').exists().isString().isLength({ min: 1, max: 255 }).trim(),
    check('email').exists().isEmail().isLength({ min: 1, max: 255 }).trim(),
    check('phoneNumber').exists().isLength({ min: 1, max: 255 }).trim(),
    check('password').if((value) => value !== undefined && value !== "").isString().isLength({ min: 4, max: 50 }).trim(),
    check('role').isIn([Role.ADMIN, Role.CUSTOMER])
]