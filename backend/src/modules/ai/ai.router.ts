import { Router } from 'express'
import { chatbotHandler } from './ai.controller'

const router = Router()

router.post('/chatbot/chat', chatbotHandler)

export default router
