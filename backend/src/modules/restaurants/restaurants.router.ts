import { Router } from 'express'
import { listHandler, getByIdHandler, createHandler, updateHandler, removeHandler } from './restaurants.controller'

const router = Router()

router.get('/', listHandler)
router.get('/:id', getByIdHandler)
router.post('/', createHandler)
router.patch('/:id', updateHandler)
router.delete('/:id', removeHandler)

export default router
