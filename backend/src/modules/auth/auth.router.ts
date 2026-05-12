import { Router } from 'express'
import { requireAuth } from '../../middleware/auth'
import { registerHandler, loginHandler, meHandler } from './auth.controller'

const router = Router()

router.post('/register', registerHandler)
router.post('/login', loginHandler)
router.get('/me', requireAuth, meHandler)

export default router
