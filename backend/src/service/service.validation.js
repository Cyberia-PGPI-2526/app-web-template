import { check, param } from 'express-validator'

export const createServiceValidation = [
  check('name')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('name is required')
    .isString()
    .isLength({ min: 1, max: 255 })
    .trim(),
  check('description')
    .optional({ nullable: true })
    .isString()
    .isLength({ max: 2000 })
    .trim(),
  check('disabled')
    .optional()
    .isBoolean()
    .withMessage('disabled must be boolean'),
]

export const updateServiceValidation = [
  param('id').exists().isInt().withMessage('id must be an integer'),
  check('name')
    .optional()
    .isString()
    .isLength({ min: 1, max: 255 })
    .trim(),
  check('description')
    .optional({ nullable: true })
    .isString()
    .isLength({ max: 2000 })
    .trim(),
  check('disabled')
    .optional()
    .isBoolean()
    .withMessage('disabled must be boolean'),
]

export const idParamValidation = [
  param('id').exists().isInt().withMessage('id must be an integer')
]
