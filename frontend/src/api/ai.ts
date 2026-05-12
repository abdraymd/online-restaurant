import { apiClient } from './client'

export interface AiCartItem {
  menuItemId: string
  name?: string | null
  quantity: number
  price?: number | null
  notes?: string | null
}

export interface AiChatRequest {
  sessionId: string
  restaurantId?: string
  message: string
}

export interface AiChatResponse {
  reply: string
  cartUpdated: boolean
  cart: AiCartItem[]
  sessionId: string
}

export async function sendAiChatMessage(payload: AiChatRequest): Promise<AiChatResponse> {
  const response = await apiClient.post<AiChatResponse>('/ai/chatbot/chat', payload)
  return response.data
}
