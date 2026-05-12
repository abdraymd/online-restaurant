import { Router } from 'express'
import { listHandler, createHandler, updateHandler, removeHandler, searchHandler } from './menu-items.controller'

// Nested under /restaurants/:restaurantId/menu-items
export const nestedRouter = Router({ mergeParams: true })
nestedRouter.get('/', listHandler)
nestedRouter.post('/', createHandler)

// Flat: /menu-items
export const flatRouter = Router()
flatRouter.get('/', searchHandler)       // GET /menu-items?query=&restaurantId= (used by AI chatbot)
flatRouter.patch('/:id', updateHandler)
flatRouter.delete('/:id', removeHandler)
