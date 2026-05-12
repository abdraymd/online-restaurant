---
title: AI Chatbot Service Protocol
service: service-chatbot
port: 8002
owner: AI
---

# AI Chatbot Service Protocol

## Purpose

This service exposes an AI ordering assistant for the online restaurant platform. It helps users search menu items, add items to an in-memory cart, view the cart, fetch restaurant details, and place an order through the backend.

## Runtime Contract

- **Service URL:** `http://localhost:8002`
- **Endpoint:** `POST /chat`
- **Auth header:** `X-Service-Key: <SERVICE_KEY>`
- **Frontend access:** frontend must call the backend only; backend proxies to this AI service.
- **Session storage:** in-memory by `sessionId`, auto-expired after 30 minutes.
- **OpenAI model:** configured by `OPENAI_CHAT_MODEL`, default `gpt-4o`.

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

### `search_menu(query, restaurantId)`

- Calls backend `GET /menu-items` with `query` and optional `restaurantId`.
- Returns menu matches for the assistant to summarize.

### `add_to_cart(menuItemId, quantity, name, price, notes)`

- Updates the AI service in-memory session cart.
- Does not write to backend.

### `view_cart()`

- Returns the current in-memory session cart.

### `get_restaurant_info(restaurantId)`

- Calls backend `GET /restaurants/{restaurantId}`.
- Returns restaurant data available from backend.

### `place_order(deliveryAddress)`

- Calls backend `POST /orders` using current session cart.
- Clears the cart only after a successful backend response.
- Assistant must confirm items, quantities, restaurant, and delivery address before using this tool.

## Backend Requirements

Backend should expose/proxy:

- `POST /api/v1/ai/chatbot/chat` or similar public backend route for frontend.
- The backend route forwards to `POST http://localhost:8002/chat`.
- Backend must include `X-Service-Key` when calling this AI service.
- Backend should not expose `SERVICE_KEY` or `OPENAI_API_KEY` to frontend.
- Expected backend API targets used by tools:
  - `GET /api/v1/menu-items?query=...&restaurantId=...`
  - `GET /api/v1/restaurants/{restaurantId}`
  - `POST /api/v1/orders`

## Frontend Requirements

Frontend should send chat messages to the backend proxy, not directly to port `8002`.

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
uvicorn main:app --reload --port 8002
```

If the real OpenAI key is stored in `ai/.env`, the service also loads that file. Real `.env` files are gitignored.
