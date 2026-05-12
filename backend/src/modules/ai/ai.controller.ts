import { Request, Response } from 'express'
import { z } from 'zod'
import { config } from '../../config'
import { AppError } from '../../middleware/errorHandler'

const chatSchema = z.object({
  sessionId: z.string().min(1),
  restaurantId: z.string().optional(),
  message: z.string().min(1),
})

export async function chatbotHandler(req: Request, res: Response) {
  if (!config.SERVICE_KEY) {
    throw new AppError(503, 'SERVICE_UNAVAILABLE', 'AI chatbot service is not configured')
  }

  const body = chatSchema.parse(req.body)

  // Extract optional user JWT — forwarded as authToken so the AI service can place orders on behalf of the user
  const authHeader = req.headers.authorization
  const authToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined

  const response = await fetch(`${config.AI_CHATBOT_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Service-Key': config.SERVICE_KEY,
    },
    body: JSON.stringify({ ...body, ...(authToken && { authToken }) }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new AppError(502, 'AI_SERVICE_ERROR', text || 'AI service returned an error')
  }

  res.json(await response.json())
}
