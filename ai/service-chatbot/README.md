# AI Chatbot Service

## Status

Implemented as the MVP AI ordering assistant for the online restaurant platform.

## Capabilities

The chatbot can:

- Search menu items for the current restaurant using natural language.
- Fetch restaurant details from the backend.
- Maintain an in-memory AI cart per browser chat session.
- Add menu items to the AI cart with quantity, optional name, price, and notes.
- Show the current AI cart.
- Place an order through the backend after confirming cart contents and delivery address.
- Forward a signed-in user's JWT to backend order routes when the frontend request includes auth.

The chatbot must not invent menu items, prices, policies, order IDs, or delivery estimates. Live restaurant, menu, and order state comes from backend API calls.

## Tech Stack

- Python 3.11+
- FastAPI
- Uvicorn
- Pydantic v2
- LangChain tool-calling agent
- `langchain-openai` with OpenAI chat models
- `ConversationSummaryBufferMemory` for per-session conversation memory
- `requests` for backend REST calls
- `python-dotenv` for local environment loading

## Architecture

```text
Frontend React app
  -> POST /api/v1/ai/chatbot/chat
Backend Node/Express proxy
  -> POST http://localhost:8002/chat
AI FastAPI chatbot service
  -> backend REST tools for menu, restaurants, cart-backed order placement
```

The frontend never calls the AI service directly. It calls the backend proxy so secrets stay server-side.

## Runtime Contract

- Service URL: `http://localhost:8002`
- Health check: `GET /health`
- Chat endpoint: `POST /chat`
- Service auth header: `X-Service-Key: <SERVICE_KEY>`
- Session storage: process memory keyed by `sessionId`
- Session TTL: 30 minutes
- Default model: `gpt-4o`, configurable via `OPENAI_CHAT_MODEL`

## Environment Variables

The service loads values from both:

- `ai/.env`
- `ai/service-chatbot/.env`

Service-level values override shared values unless they are placeholders such as `sk-your...` or `replace_with...`.

| Variable | Required | Example | Notes |
|---|---:|---|---|
| `OPENAI_API_KEY` | yes | `sk-...` | Required for LangChain/OpenAI chat calls. |
| `SERVICE_KEY` | yes | `my_shared_secret` | Must match `backend/.env` `SERVICE_KEY`. |
| `BACKEND_API_URL` | yes | `http://localhost:3000/api/v1` | Base URL used by AI tools. |
| `OPENAI_CHAT_MODEL` | no | `gpt-4o` | OpenAI chat model name. |
| `PORT` | no | `8002` | Used for documentation/run consistency; Uvicorn port is passed by CLI. |

## Request Schema

```json
{
  "sessionId": "browser-session-id",
  "restaurantId": "restaurant_id_optional",
  "message": "Add a burger and a drink to my cart",
  "userId": "optional_user_id",
  "authToken": "optional_user_jwt_forwarded_by_backend"
}
```

| Field | Required | Source | Notes |
|---|---:|---|---|
| `sessionId` | yes | Frontend | Stable ID stored in browser `localStorage`. |
| `restaurantId` | no | Frontend | Required for menu search, restaurant lookup, and order placement. |
| `message` | yes | Frontend | User's natural-language chat message. |
| `userId` | no | Backend/legacy | Accepted by schema but not currently required for tool calls. |
| `authToken` | no | Backend proxy | Forwarded as `Authorization: Bearer ...` when AI tools call protected backend routes. |

## Response Schema

```json
{
  "reply": "I added 1 burger to your cart. Would you like anything else?",
  "cartUpdated": true,
  "cart": [
    {
      "menuItemId": "menu_item_id",
      "name": "Burger",
      "quantity": 1,
      "price": 12.99,
      "notes": null
    }
  ],
  "sessionId": "browser-session-id"
}
```

## Tools

### `search_menu(query)`

Searches backend menu items for the active `restaurantId`.

Backend call:

```text
GET /api/v1/menu-items?query=...&restaurantId=...
```

### `get_restaurant_info()`

Fetches the active restaurant's details.

Backend call:

```text
GET /api/v1/restaurants/{restaurantId}
```

### `add_to_cart(menuItemId, quantity, name, price, notes)`

Adds an item to the AI service's in-memory session cart. This does not update the frontend Zustand cart or persist anything in the backend.

### `view_cart()`

Returns the current AI cart for the active `sessionId`.

### `place_order(deliveryAddress)`

Creates a backend order using the current AI cart.

Backend call:

```text
POST /api/v1/orders
```

Payload shape:

```json
{
  "restaurantId": "restaurant_id",
  "items": [
    { "menuItemId": "menu_item_id", "quantity": 1 }
  ],
  "note": "Delivery: address. Item notes..."
}
```

The cart is cleared only after a successful backend response.

## Backend Proxy

The backend exposes:

```text
POST /api/v1/ai/chatbot/chat
```

The backend validates the public request body, forwards the request to `POST /chat`, includes `X-Service-Key`, and forwards the optional user JWT as `authToken`.

## Frontend Integration

The React frontend includes:

- `frontend/src/api/ai.ts`
- `frontend/src/pages/AiAssistantPage.tsx`
- route: `/ai-assistant`
- navbar link: `AI Assistant`

Frontend request payload:

```json
{
  "sessionId": "localStorage-ai-chat-session-id",
  "restaurantId": "optional_restaurant_id",
  "message": "Show my cart"
}
```

## Local Run

Install dependencies:

```bash
cd ai/service-chatbot
pip install -r requirements.txt
```

Run the service:

```bash
python3 -m uvicorn main:app --reload --port 8002
```

Health check:

```bash
curl http://localhost:8002/health
```

Direct chat smoke test:

```bash
curl -X POST http://localhost:8002/chat \
  -H "Content-Type: application/json" \
  -H "X-Service-Key: $SERVICE_KEY" \
  -d '{"sessionId":"debug","message":"hello"}'
```

Preferred end-to-end smoke test through backend:

```bash
curl -X POST http://localhost:3000/api/v1/ai/chatbot/chat \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"debug","message":"hello"}'
```

## Troubleshooting

- `401` from AI service: `X-Service-Key` is missing or does not match.
- `502 AI_SERVICE_ERROR` from backend: backend reached the AI service, but AI returned an error.
- `Internal Server Error` from `/chat`: check `OPENAI_API_KEY`, model name, backend URL, and backend server availability.
- Frontend message says it could not reach the AI assistant: check backend `3000`, AI service `8002`, and `frontend/.env` `VITE_API_BASE_URL`.
