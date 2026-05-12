import { Router } from 'express'
import { listHandler, createHandler, updateHandler, removeHandler } from './menu-items.controller'

// Nested under /restaurants/:restaurantId/menu-items
export const nestedRouter = Router({ mergeParams: true })
nestedRouter.get('/', listHandler)
nestedRouter.post('/', createHandler)

// Flat: /menu-items/:id
export const flatRouter = Router()
flatRouter.patch('/:id', updateHandler)
flatRouter.delete('/:id', removeHandler)
