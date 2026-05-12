import { FormEvent, useMemo, useRef, useState } from 'react'
import { Bot, Send, Sparkles, User, Utensils } from 'lucide-react'
import { toast } from 'sonner'
import { sendAiChatMessage, type AiCartItem } from '@/api/ai'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

function createSessionId() {
  const existing = window.localStorage.getItem('ai-chat-session-id')
  if (existing) return existing
  const next = crypto.randomUUID()
  window.localStorage.setItem('ai-chat-session-id', next)
  return next
}

function formatCartItem(item: AiCartItem) {
  const name = item.name || item.menuItemId
  return `${item.quantity} × ${name}`
}

export function AiAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hi! I can help you find dishes, build your cart, and place an order. What are you craving today?',
    },
  ])
  const [message, setMessage] = useState('')
  const [restaurantId, setRestaurantId] = useState('')
  const [cart, setCart] = useState<AiCartItem[]>([])
  const [isSending, setIsSending] = useState(false)
  const sessionIdRef = useRef(createSessionId())

  const cartSummary = useMemo(() => {
    if (cart.length === 0) return 'Your AI cart is empty.'
    return cart.map(formatCartItem).join(', ')
  }, [cart])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = message.trim()
    if (!trimmed || isSending) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
    }

    setMessages((current) => [...current, userMessage])
    setMessage('')
    setIsSending(true)

    try {
      const response = await sendAiChatMessage({
        sessionId: sessionIdRef.current,
        restaurantId: restaurantId.trim() || undefined,
        message: trimmed,
      })

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: response.reply,
        },
      ])
      setCart(response.cart)
      if (response.cartUpdated) toast.success('AI cart updated')
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'I could not reach the AI assistant. Please make sure the backend and AI service are running.',
        },
      ])
      toast.error('AI assistant request failed')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          <div className="bg-white border shadow-sm rounded-3xl overflow-hidden">
            <div className="bg-gray-900 text-white px-6 py-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-orange-500 flex items-center justify-center">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">AI Ordering Assistant</h1>
                  <p className="text-sm text-gray-300">Ask naturally, order faster</p>
                </div>
              </div>
              <Sparkles className="w-6 h-6 text-orange-300" />
            </div>

            <div className="h-[560px] overflow-y-auto p-5 space-y-4 bg-gray-50">
              {messages.map((item) => (
                <div
                  key={item.id}
                  className={`flex gap-3 ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {item.role === 'assistant' && (
                    <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                      <Bot className="w-5 h-5" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                      item.role === 'user'
                        ? 'bg-orange-500 text-white rounded-tr-sm'
                        : 'bg-white text-gray-800 border rounded-tl-sm'
                    }`}
                  >
                    {item.content}
                  </div>
                  {item.role === 'user' && (
                    <div className="w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="border-t bg-white p-4 space-y-3">
              <input
                value={restaurantId}
                onChange={(event) => setRestaurantId(event.target.value)}
                placeholder="Optional restaurant ID for restaurant-specific orders"
                className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-400"
              />
              <div className="flex gap-3">
                <input
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Try: Find me a burger and a drink"
                  className="flex-1 rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
                />
                <button
                  type="submit"
                  disabled={isSending || !message.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-medium text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Send className="w-4 h-4" />
                  {isSending ? 'Sending' : 'Send'}
                </button>
              </div>
            </form>
          </div>

          <aside className="space-y-4">
            <div className="bg-white border shadow-sm rounded-3xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Utensils className="w-5 h-5 text-orange-500" />
                <h2 className="font-semibold text-gray-900">AI Cart</h2>
              </div>
              <p className="text-sm text-gray-600 leading-6">{cartSummary}</p>
            </div>

            <div className="bg-white border shadow-sm rounded-3xl p-5">
              <h2 className="font-semibold text-gray-900 mb-3">Try asking</h2>
              <div className="space-y-2 text-sm text-gray-600">
                <button onClick={() => setMessage('What can I order here?')} className="block w-full text-left rounded-xl bg-gray-50 hover:bg-orange-50 px-3 py-2">
                  What can I order here?
                </button>
                <button onClick={() => setMessage('Add a burger and a drink to my cart')} className="block w-full text-left rounded-xl bg-gray-50 hover:bg-orange-50 px-3 py-2">
                  Add a burger and a drink to my cart
                </button>
                <button onClick={() => setMessage('Show my cart')} className="block w-full text-left rounded-xl bg-gray-50 hover:bg-orange-50 px-3 py-2">
                  Show my cart
                </button>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}
