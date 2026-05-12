---
title: AI Chatbot Service Protocol
service: service-chatbot
port: 8002
owner: AI
---

# AI Chatbot Service Protocol

## Purpose

This service exposes an AI ordering assistant for the online restaurant platform. It helps users search menu items, add items to an in-memory cart, view the cart, fetch restaurant details, and place an order through the backend.

## Current Implementation

- **Runtime:** FastAPI + Uvicorn on port `8002`.
- **Agent stack:** LangChain tool-calling agent using `langchain-openai`.
- **LLM:** OpenAI chat model configured by `OPENAI_CHAT_MODEL`, default `gpt-4o`.
- **Memory:** `ConversationSummaryBufferMemory` per `sessionId`.
- **Tool state:** In-memory AI cart per `sessionId`, auto-expired after 30 minutes.
- **Backend access:** `requests` calls to backend REST endpoints using `BACKEND_API_URL`.
- **Frontend integration:** React page at `/ai-assistant` calls backend proxy `POST /api/v1/ai/chatbot/chat`.

## Runtime Contract

- **Service URL:** `http://localhost:8002`
- **Health check:** `GET /health`
- **Endpoint:** `POST /chat`
- **Auth header:** `X-Service-Key: <SERVICE_KEY>`
- **Frontend access:** frontend must call the backend only; backend proxies to this AI service.
- **Session storage:** in-memory by `sessionId`, auto-expired after 30 minutes.
- **OpenAI model:** configured by `OPENAI_CHAT_MODEL`, default `gpt-4o`.

## Environment Loading

The service loads environment values from:

1. `ai/.env`
2. `ai/service-chatbot/.env`

Service-specific values override shared values unless they are placeholders like `sk-your...` or `replace_with...`. This lets a shared `ai/.env` hold the real `OPENAI_API_KEY` while generated `.env.example` placeholders remain safe.

Required variables:

| Variable | Notes |
| --- | --- |
| `OPENAI_API_KEY` | Required for OpenAI/LangChain calls. |
| `SERVICE_KEY` | Must match `backend/.env` `SERVICE_KEY`. |
| `BACKEND_API_URL` | Usually `http://localhost:3000/api/v1`. |
| `OPENAI_CHAT_MODEL` | Optional, defaults to `gpt-4o`. |

## Request Schema

```json
{
  "sessionId": "abc123",
  "restaurantId": "restaurant_1",
  "message": "I want a large pepperoni pizza and a Coke",
  "userId": "user_1",
  "authToken": "optional-user-jwt-for-order-placement"
}
```

| Field | Required | Owner | Notes |
| --- | --- | --- | --- |
| `sessionId` | yes | frontend/backend | Stable ID for one chat thread. |
| `restaurantId` | no | frontend/backend | Required for restaurant-scoped order actions. |
| `message` | yes | frontend | User's natural language message. |
| `userId` | no | backend | Passed to backend order creation if available. |
| `authToken` | no | backend | Used only when backend order endpoint requires user auth. |

## Response Schema

```json
{
  "reply": "I added 1 pepperoni pizza to your cart. Would you like anything else?",
  "cartUpdated": true,
  "cart": [
    {
      "menuItemId": "item_1",
      "name": "Pepperoni Pizza",
      "quantity": 1,
      "price": 14.99,
      "notes": null
    }
  ],
  "sessionId": "abc123"
}
```

## AI Tool Protocol

The agent uses OpenAI function-calling tools. It must use tools for live state and must not invent unavailable menu items, prices, delivery estimates, policies, or order IDs.

### `search_menu(query)`

- Calls backend `GET /menu-items` with `query` and the active request `restaurantId`.
- Returns menu matches for the assistant to summarize.

### `add_to_cart(menuItemId, quantity, name, price, notes)`

- Updates the AI service in-memory session cart.
- Does not write to backend.

### `view_cart()`

- Returns the current in-memory session cart.

### `get_restaurant_info()`

- Calls backend `GET /restaurants/{restaurantId}` using the active request `restaurantId`.
- Returns restaurant data available from backend.

### `place_order(deliveryAddress)`

- Calls backend `POST /orders` using current session cart.
- Sends `restaurantId`, item IDs/quantities, and a single `note` containing delivery address and item notes.
- Forwards user JWT as `Authorization: Bearer <token>` when backend proxy provided `authToken`.
- Clears the cart only after a successful backend response.
- Assistant must confirm items, quantities, restaurant, and delivery address before using this tool.

## Backend Requirements

Backend exposes/proxies:

- `POST /api/v1/ai/chatbot/chat` for the frontend.
- The backend route forwards to `POST http://localhost:8002/chat`.
- Backend must include `X-Service-Key` when calling this AI service.
- Backend forwards a signed-in user's JWT as `authToken` so order placement can call protected routes.
- Backend should not expose `SERVICE_KEY` or `OPENAI_API_KEY` to frontend.
- Expected backend API targets used by tools:
  - `GET /api/v1/menu-items?query=...&restaurantId=...`
  - `GET /api/v1/restaurants/{restaurantId}`
  - `POST /api/v1/orders`

## Frontend Integration

Frontend sends chat messages to the backend proxy, not directly to port `8002`.

Implemented frontend files:

- `frontend/src/api/ai.ts`
- `frontend/src/pages/AiAssistantPage.tsx`
- Route: `/ai-assistant`
- Navbar link: `AI Assistant`

Recommended frontend payload:

```json
{
  "sessionId": "browser-generated-or-backend-generated-id",
  "restaurantId": "current_restaurant_id",
  "message": "Add two chicken burgers"
}
```

Frontend should render:

- `reply` as assistant text.
- `cart` as the current AI cart preview.
- `cartUpdated` to refresh cart UI state.

The current AI cart is separate from the standard frontend cart store. It exists in the AI service session until order placement succeeds or the session expires.

## QA Test Cases

1. Missing `X-Service-Key` returns `401`.
2. Invalid `X-Service-Key` returns `401`.
3. Valid `/health` returns `{"status":"ok"}`.
4. `POST /chat` with a menu-search request returns a natural language reply.
5. Multi-turn session keeps cart state for the same `sessionId`.
6. Different `sessionId` values do not share carts.
7. Place-order request with empty cart returns an explanatory reply and does not call successful order creation.
8. Order placement clears cart only after backend success.

## Local Run

```bash
cd ai/service-chatbot
pip install -r requirements.txt
cp .env.example .env
python3 -m uvicorn main:app --reload --port 8002
```

If the real OpenAI key is stored in `ai/.env`, the service also loads that file. Real `.env` files are gitignored.

End-to-end backend proxy smoke test:

```bash
curl -X POST http://localhost:3000/api/v1/ai/chatbot/chat \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"debug","message":"hello"}'
```

## Troubleshooting

- `401` from AI service means `X-Service-Key` is missing or invalid.
- `502 AI_SERVICE_ERROR` from backend means backend reached the AI service, but the AI service returned an error.
- `Internal Server Error` from `/chat` usually means `OPENAI_API_KEY`, `OPENAI_CHAT_MODEL`, `BACKEND_API_URL`, or backend availability should be checked.
- Frontend fallback text saying it could not reach the AI assistant means the browser request to backend failed or backend returned an AI proxy error.
