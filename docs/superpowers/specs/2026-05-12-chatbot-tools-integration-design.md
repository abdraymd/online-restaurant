---
name: chatbot-tools-integration
description: Fix schema mismatches between AI chatbot place_order tool and backend orders API
metadata:
  type: project
---

# Chatbot Tools Integration Design

## Problem

The `place_order` tool in `ai/service-chatbot/main.py` sends three fields the backend silently drops:
- `userId` — backend ignores it (uses JWT for identity)
- `deliveryAddress` — not in `placeOrderSchema`, Zod strips it
- Per-item `notes` — `OrderItem` has no such column

Additionally `search_menu` and `get_restaurant_info` return raw `response.text` on errors, so the LLM receives raw JSON error blobs instead of readable messages.

## Decision

Simplify the AI tool payload to match the existing backend schema. No database migration.

## Architecture

All changes are in `ai/service-chatbot/main.py` only.

### `place_order` tool
- Remove `userId` from payload.
- Remove `notes` from each item in the items list.
- Build a single `note` string: `"Delivery: {deliveryAddress}"` followed by any per-item notes formatted as `"{name}: {notes}"`.
- Check `response.ok`; return a readable error string on failure instead of raw JSON.

### `search_menu` / `get_restaurant_info`
- Check `response.ok`; return `"Error {status}: {text}"` on failure so the agent can report it cleanly.

## Data Flow

```
place_order(deliveryAddress="123 Main", cart=[{notes:"no onions"}])
  → payload = {restaurantId, items:[{menuItemId,quantity}], note:"Delivery: 123 Main. Burger: no onions."}
  → POST /api/v1/orders  (Authorization: Bearer <authToken>)
  → 201 or readable error string
```

## Error Handling

All three tools (`search_menu`, `get_restaurant_info`, `place_order`) return a human-readable error string on non-2xx responses so the LangChain agent can surface them to the user.

## Testing

- Unit: call each tool with a mocked `requests` response (success + error cases).
- Integration: run chatbot service locally against a seeded backend, confirm an end-to-end order places successfully.
