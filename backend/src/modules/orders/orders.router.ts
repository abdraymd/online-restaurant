import { Router } from 'express'
import { requireAuth } from '../../middleware/auth'
import { placeOrderHandler, listHandler, getByIdHandler, updateStatusHandler, cancelHandler } from './orders.controller'

const router = Router()

router.use(requireAuth)

router.post('/', placeOrderHandler)
router.get('/', listHandler)
router.get('/:id', getByIdHandler)
router.patch('/:id/status', updateStatusHandler)
router.delete('/:id', cancelHandler)

export default router
