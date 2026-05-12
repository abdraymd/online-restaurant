import { Router } from 'express'
import { requireAuth, requireRole } from '../../middleware/auth'
import { listHandler, getByIdHandler, removeHandler } from './users.controller'

const router = Router()

router.use(requireAuth, requireRole('ADMIN'))

router.get('/', listHandler)
router.get('/:id', getByIdHandler)
router.delete('/:id', removeHandler)

export default router
