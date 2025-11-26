import { check } from 'express-validator'
import { AppointmentState } from "@prisma/client"

const timeCheck = (field) =>
  check(field)
    .exists()
    .withMessage(`${field} es requerido.`)
    .isISO8601()
    .toDate()

export const createAppointmentValidation = [
  timeCheck('appointment_date'),
  timeCheck('start_time'),
  check('serviceId')
    .exists()
    .withMessage('serviceId es requerido.')
    .isInt({ gt: 0 })
    .withMessage('serviceId debe ser un número entero positivo.')
    .toInt(),
]

export const updateAppointmentValidation = [
  check('appointment_date')
    .optional()
    .isISO8601()
    .withMessage('appointment_date debe tener formato ISO.')
    .toDate(),

  check('start_time')
    .optional()
    .isISO8601()
    .withMessage('start_time debe tener formato ISO.')
    .toDate(),

  check('serviceId')
    .optional()
    .isInt({ gt: 0 })
    .withMessage('serviceId debe ser un número entero positivo.')
    .toInt(),

  check('state')
    .optional()
    .toUpperCase()
    .isIn(Object.values(AppointmentState))
    .withMessage(`state debe ser uno de: ${Object.values(AppointmentState).join(', ')}`)
]
