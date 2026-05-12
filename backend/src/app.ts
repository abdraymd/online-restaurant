import 'express-async-errors'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { config } from './config'
import { errorHandler } from './middleware/errorHandler'
import authRouter from './modules/auth/auth.router'
import restaurantsRouter from './modules/restaurants/restaurants.router'
import { nestedRouter, flatRouter } from './modules/menu-items/menu-items.router'
import ordersRouter from './modules/orders/orders.router'
import usersRouter from './modules/users/users.router'

export function createApp() {
  const app = express()

  app.use(helmet())
  app.use(cors({ origin: config.CORS_ORIGIN, credentials: true }))
  app.use(express.json())
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 200,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  )

  // Health check
  app.get('/health', (_req, res) => res.json({ status: 'ok' }))

  app.use('/api/v1/auth', authRouter)
  app.use('/api/v1/restaurants', restaurantsRouter)
  app.use('/api/v1/restaurants/:restaurantId/menu-items', nestedRouter)
  app.use('/api/v1/menu-items', flatRouter)
  app.use('/api/v1/orders', ordersRouter)
  app.use('/api/v1/users', usersRouter)

  app.use(errorHandler)

  return app
}
