import express from "express"
import helmet from "helmet"
import cookieParser from "cookie-parser"
import cors from 'cors'
import { ORIGIN } from "./config/env.js"
import { userRoutes } from "./user/user.routes.js"
import { authRoutes } from "./auth/auth.routes.js"
import { appointmentRoutes } from "./appointment/appointment.route.js"
import { serviceRoutes } from "./service/service.routes.js"
import { availabilityRouter } from "./availability/availability.routes.js"
import { chatRoutes, ordersRoutes } from "./order/order.routes.js"


export const app = express()

app.use(helmet())
app.use(express.json())
app.use(cookieParser())



app.use(cors({
  origin: ORIGIN,
  credentials: true,
}))


app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/users', userRoutes)
app.use('/api/v1/appointments', appointmentRoutes)
app.use('/api/v1/services', serviceRoutes)
app.use('/api/v1/availability', availabilityRouter)
app.use('/api/v1/chat', chatRoutes)
app.use('/api/v1/orders', ordersRoutes)

app.get('/api/v1/health', 
  async (req, res) => {
    res.send({ message: ok})
  }
)