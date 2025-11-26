import { prisma } from "../config/db.js"
import { processMessage, saveExtractedOrder } from "./order.service.js"

export async function receiveMessage(req, res) {
  try {
    const message = req.body

    const reply = await processMessage(message)
    res.status(200).json(reply)
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message })
  }
}

export async function receiveOrder(req, res) {
  try {
    const userId = req.user.userId
    const products = req.body.products

    const result = await saveExtractedOrder(userId, products)
    res.status(201).json(result)
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message })
  }
}

export async function getMyOrders(req, res) {
  try {
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    const userId = req.user.userId;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        skip,
        take: limit,
        include: {
          orderProducts: {
            select: {
              id: true,
              quantity: true,
              product: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        },
        orderBy: {
          order_date: 'desc'
        }
      }),
      prisma.order.count({
        where: { userId }
      })
    ]);

    return res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      orders
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}


export async function getOrders(req, res) {
  try {
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        skip,
        take: limit,
        include: {
          user: {
            select: {
              email: true
            }
          },
          orderProducts: {
            select: {
              id: true,
              quantity: true,
              product: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        },
        orderBy: {
          order_date: 'desc'
        }
      }),
      prisma.order.count({})
    ]);

    return res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      orders
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

