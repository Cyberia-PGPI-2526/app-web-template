import { Router } from 'express';
import { requiresAuth, checkRole } from '../auth/auth.middleware.js';
import { getMyOrders, getOrders, receiveMessage, receiveOrder } from './order.controller.js';

export const chatRoutes = Router();
export const ordersRoutes = Router();

chatRoutes.post('/message',
  requiresAuth,
  checkRole('CUSTOMER'),
  receiveMessage
);

chatRoutes.post('/order',
  requiresAuth,
  checkRole('CUSTOMER'),
  receiveOrder
);

ordersRoutes.get('/me',
  requiresAuth,
  checkRole('CUSTOMER'),
  getMyOrders
);

ordersRoutes.get('',
  requiresAuth,
  checkRole('ADMIN'),
  getOrders
);

