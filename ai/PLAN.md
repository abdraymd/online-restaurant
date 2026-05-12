# AI Engineering Plan — Online Restaurant Ordering Platform

## 1. AI Features to Build

| # | Feature | Port | Tech | When it ships |
|---|---------|------|------|---------------|
| 1 | Semantic Search | 8001 | OpenAI embeddings + Chroma | Day 3 — no training data needed |
| 2 | Chatbot Ordering Assistant | 8002 | FastAPI + LangChain tool-calling agent + GPT-4o | Implemented MVP — no training data needed |
| 3 | Review Sentiment Analysis | 8003 | GPT-4o-mini | Day 9 — retroactive on existing reviews |
| 4 | Smart Upsell Engine | 8004 | Co-occurrence matrix | Day 13 — needs order history |
| 5 | Personalized Recommendations | 8005 | ALS collaborative filtering | Day 16 — most data-hungry |

---

## 2. Tech Stack

| Concern | Choice |
|---------|--------|
| Language | Python 3.11+ |
| API framework | FastAPI + Uvicorn |
| LLM provider | OpenAI (GPT-4o, GPT-4o-mini, text-embedding-3-small) |
| Vector database | Chroma (local, file-backed) → swap to Pinecone in prod via env var |
| Collaborative filtering | `implicit` library (ALS) |
| Data serialization | `pickle` for trained models |
| HTTP client | `httpx` (async) for calling backend API |
| Validation | Pydantic v2 |
| Environment | `python-dotenv` |
| Dependency management | `pip` + `requirements.txt` per service |

Implemented chatbot additions:

| Concern | Current choice |
|---------|----------------|
| Agent framework | LangChain tool-calling agent |
| Chat memory | `ConversationSummaryBufferMemory` per `sessionId` |
| Backend HTTP client | `requests` in `service-chatbot` |
| Frontend integration | React page `/ai-assistant` via backend proxy |

---

## 3. Folder Structure

```
ai/
├── PLAN.md
├── shared/
│   ├── auth.py             # X-Service-Key validation middleware
│   ├── models.py           # Shared Pydantic schemas
│   └── backend_client.py   # httpx client to call backend REST API
│
├── service-search/         # Semantic Search — port 8001
│   ├── main.py
│   ├── embedder.py         # Embed text with text-embedding-3-small
│   ├── indexer.py          # Build/refresh Chroma index from menu items
│   ├── searcher.py         # Query Chroma, return ranked results
│   ├── requirements.txt
│   └── .env.example
│
├── service-chatbot/        # Chatbot Ordering Assistant — port 8002
│   ├── main.py
│   ├── README.md           # Current service docs and troubleshooting
│   ├── ai_Dana.md          # AI engineer protocol for this service
│   ├── requirements.txt
│   └── .env.example
│
├── service-sentiment/      # Review Sentiment Analysis — port 8003
│   ├── main.py
│   ├── classifier.py       # GPT-4o-mini prompt + response parser
│   ├── batch.py            # Batch process all existing reviews
│   ├── requirements.txt
│   └── .env.example
│
├── service-upsell/         # Smart Upsell Engine — port 8004
│   ├── main.py
│   ├── cooccurrence.py     # Build item co-occurrence matrix from orders
│   ├── trainer.py          # Retrain script (run nightly)
│   ├── model/              # Persisted .pkl files
│   ├── requirements.txt
│   └── .env.example
│
├── service-recommendations/ # Personalized Recommendations — port 8005
│   ├── main.py
│   ├── als_model.py        # ALS training + inference with `implicit`
│   ├── trainer.py          # Retrain script
│   ├── model/              # Persisted .pkl files
│   ├── requirements.txt
│   └── .env.example
│
└── scripts/
    ├── seed_index.py       # One-time: embed all menu items into Chroma
    ├── retrain_all.py      # Triggers upsell + recommendation retraining
    └── test_services.sh    # Smoke-test all 5 services
```

---

## 4. Architecture — How Each Service Works

### All Services — Common Pattern

Every service:
1. Runs as an independent FastAPI app on its own port
2. Validates incoming requests with `X-Service-Key` header (checked in `shared/auth.py`)
3. The backend REST API proxies calls to these services — the frontend never calls them directly

```
Frontend → Backend (Node.js :3000) → AI Service (Python :800x)
```

Backend calls AI services with:
```
POST http://localhost:800x/endpoint
Headers: X-Service-Key: <SERVICE_KEY>
Body: JSON
```

---

### Service 1 — Semantic Search (port 8001)

**Goal**: Find restaurants/dishes by meaning, not just keyword match. "spicy noodles" finds pho and ramen even if those exact words aren't in the menu.

**How it works**:
1. **Indexing** (run once, then on menu changes): Embed each restaurant name + description and each menu item name + description using `text-embedding-3-small`. Store vectors in Chroma with metadata (restaurantId, name, type).
2. **Query**: Embed the user's search query → query Chroma for top-N most similar vectors → return ranked results.

**API**:
```
POST /search
Body: { "query": "spicy noodles", "limit": 10, "type": "restaurant" | "item" | "all" }
Response: { "results": [{ "id", "name", "type", "score", "restaurantId" }] }
```

**Key files**:
- `embedder.py` — wraps `openai.embeddings.create(model="text-embedding-3-small", input=text)`
- `indexer.py` — fetches all restaurants+menu items from backend, embeds them, upserts into Chroma
- `searcher.py` — `chroma_collection.query(query_embeddings=[...], n_results=limit)`

---

### Service 2 — Chatbot Ordering Assistant (port 8002) — Implemented MVP

**Goal**: Let users describe what they want in natural language and get helped to build an order.

**How it works**:
1. User sends a message: "I want a large pepperoni pizza and a Coke"
2. Frontend calls backend proxy `POST /api/v1/ai/chatbot/chat`
3. Backend forwards to the FastAPI chatbot `POST /chat` with `X-Service-Key`
4. LangChain + GPT-4o decides which tool(s) to call
5. Service executes backend/menu/cart/order tools
6. GPT-4o generates a natural language response
7. Session memory and AI cart are stored in process memory keyed by `sessionId`

**Tools (function calling)**:
```python
tools = [
  search_menu(query),
  add_to_cart(menuItemId, quantity, name, price, notes),
  view_cart(),
  get_restaurant_info(),
  place_order(deliveryAddress),
]
```

**API**:
```
POST /chat
Body: { "sessionId": "abc123", "restaurantId": "...", "message": "I want a large pepperoni pizza" }
Response: { "reply": "I found...", "cartUpdated": true, "cart": [...] }
```

**Implemented files**:
- `ai/service-chatbot/main.py`
- `ai/service-chatbot/requirements.txt`
- `ai/service-chatbot/README.md`
- `ai/service-chatbot/ai_Dana.md`
- `backend/src/modules/ai/ai.controller.ts`
- `backend/src/modules/ai/ai.router.ts`
- `frontend/src/api/ai.ts`
- `frontend/src/pages/AiAssistantPage.tsx`

**Current limitations**:
- The AI cart is separate from the frontend Zustand cart.
- Session state is in memory, so it resets when the AI service restarts.
- Restaurant-specific tool actions require `restaurantId`.
- Order placement requires a signed-in user if the backend order route requires auth.

---

### Service 3 — Review Sentiment Analysis (port 8003)

**Goal**: Classify restaurant reviews as POSITIVE / NEUTRAL / NEGATIVE and extract key themes.

**How it works**: Single GPT-4o-mini call per review with a structured prompt, parsed with Pydantic.

**Prompt**:
```
Analyze this restaurant review and return JSON:
{ "sentiment": "POSITIVE"|"NEUTRAL"|"NEGATIVE", "score": 0.0-1.0, "themes": ["fast delivery", ...] }

Review: {review_text}
```

**API**:
```
POST /analyze
Body: { "reviewId": "...", "text": "Great food, fast delivery!", "restaurantId": "..." }
Response: { "sentiment": "POSITIVE", "score": 0.92, "themes": ["fast delivery", "great food"] }

POST /batch
Body: { "reviews": [{ "reviewId", "text", "restaurantId" }] }
Response: { "results": [...] }
```

---

### Service 4 — Smart Upsell Engine (port 8004)

**Goal**: "Customers who ordered X also ordered Y." Based on item co-occurrence in historical orders.

**How it works**:
1. **Training**: Fetch all orders from backend. Build a co-occurrence matrix — for each order, for each pair of items, increment `matrix[item_a][item_b]`. Normalize by item frequency. Serialize to `model/cooccurrence.pkl`.
2. **Inference**: Load matrix, look up input item IDs, return top-N most co-occurring items not already in the cart.

**API**:
```
POST /upsell
Body: { "currentItemIds": ["id1", "id2"], "restaurantId": "...", "limit": 3 }
Response: { "suggestions": [{ "menuItemId", "name", "price", "score" }] }
```

---

### Service 5 — Personalized Recommendations (port 8005)

**Goal**: "Based on your order history, you might like these restaurants/dishes."

**How it works**:
1. **Training**: Fetch user-order history from backend. Build a user-item interaction matrix. Train ALS model with `implicit.als.AlternatingLeastSquares`. Serialize to `model/als_model.pkl`.
2. **Inference**: Load model, call `model.recommend(userId, user_items, N=10)`, return ranked results.
3. **Cold start** (new user): Fall back to most popular items globally.

**API**:
```
GET /recommendations?userId=...&limit=10
Response: { "recommendations": [{ "menuItemId", "name", "restaurantId", "score" }], "isPersonalized": true|false }
```

---

## 5. Step-by-Step Implementation Order

### Phase 1 — Shared Infrastructure (Day 1)
1. Create full `ai/` folder structure
2. Create `shared/auth.py` — FastAPI dependency that validates `X-Service-Key` header, raises 401 if missing/wrong
3. Create `shared/models.py` — common Pydantic schemas
4. Create `shared/backend_client.py` — async httpx client

### Phase 2 — Semantic Search Service (Days 2–3)
5. `cd service-search && pip install fastapi uvicorn openai chromadb python-dotenv pydantic httpx`
6. Create `embedder.py` — `async def embed(texts: list[str]) -> list[list[float]]`
7. Create `indexer.py` — fetch all menu items from backend, batch-embed, upsert to Chroma
8. Run `python ../../scripts/seed_index.py` to populate Chroma
9. Create `searcher.py` — query Chroma, return ranked results
10. Create `main.py` — FastAPI app with `POST /search` route + auth dependency
11. Test: `curl -X POST http://localhost:8001/search -H "X-Service-Key: ..." -d '{"query":"pizza","limit":5}'`

### Phase 3 — Chatbot Service (Days 4–6) — Completed MVP
12. `cd service-chatbot && pip install -r requirements.txt`
13. `main.py` defines FastAPI routes, LangChain tools, session memory, and cart state
14. Backend proxy route implemented at `POST /api/v1/ai/chatbot/chat`
15. Frontend AI assistant implemented at `/ai-assistant`
16. Tested with direct `/chat` and backend proxy smoke requests

### Phase 4 — Sentiment Analysis Service (Days 7–9)
17. `cd service-sentiment && pip install fastapi uvicorn openai python-dotenv pydantic`
18. Create `classifier.py` — single async function wrapping GPT-4o-mini call + Pydantic parsing
19. Create `batch.py` — fetch all reviews, classify, write back to backend
20. Create `main.py` — `POST /analyze` and `POST /batch` routes
21. Run `batch.py` once to classify all existing reviews

### Phase 5 — Upsell Engine (Days 10–13)
22. `cd service-upsell && pip install fastapi uvicorn numpy scipy httpx pydantic python-dotenv`
23. Create `cooccurrence.py` — build + normalize matrix from order data
24. Create `trainer.py` — fetch orders, build matrix, save `model/cooccurrence.pkl`
25. Run `python trainer.py` to generate first model
26. Create `main.py` — load model on startup, `POST /upsell` route

### Phase 6 — Recommendations (Days 14–16)
27. `cd service-recommendations && pip install fastapi uvicorn implicit numpy scipy httpx pydantic python-dotenv`
28. Create `als_model.py` — build user-item matrix, train ALS, inference with cold-start fallback
29. Create `trainer.py` — fetch order history, train, save `model/als_model.pkl`
30. Run `python trainer.py` to generate first model
31. Create `main.py` — load model on startup, `GET /recommendations` route

### Phase 7 — Integration + Scripts (Day 17)
32. Write `scripts/seed_index.py`
33. Write `scripts/retrain_all.py` — calls upsell + recommendations trainers
34. Write `scripts/test_services.sh` — smoke-tests all 5 services with curl
35. Run `bash scripts/test_services.sh` — all pass

---

## 6. Environment Variables

Each service has its own `.env` file. Create `.env.example` in each service folder (commit that, not the real `.env`).

```dotenv
# ai/service-*/. env (never commit)

OPENAI_API_KEY=sk-...
SERVICE_KEY=replace_with_shared_secret_matching_backend
BACKEND_API_URL=http://localhost:3000/api/v1
CHROMA_PATH=./chroma_data          # only service-search
PORT=8001                           # 8001–8005 per service
```

For the implemented chatbot service, values are loaded from both `ai/.env` and `ai/service-chatbot/.env`. Service-specific values override shared values unless they are placeholders like `sk-your...` or `replace_with...`.

---

## 7. How to Run Locally

### Prerequisites
- Python 3.11+, pip
- Backend running on port 3000

### Start the implemented chatbot service
```bash
cd ai/service-chatbot
pip install -r requirements.txt
cp .env.example .env   # fill in real values
python3 -m uvicorn main:app --reload --port 8002
```

### Start all planned services (when implemented)
```bash
cd ai/service-search && uvicorn main:app --reload --port 8001
cd ai/service-chatbot && uvicorn main:app --reload --port 8002
cd ai/service-sentiment && uvicorn main:app --reload --port 8003
cd ai/service-upsell && uvicorn main:app --reload --port 8004
cd ai/service-recommendations && uvicorn main:app --reload --port 8005
```

### First-time setup
```bash
# Seed search index (after backend has data)
python ai/scripts/seed_index.py

# Train offline models (after orders accumulate)
python ai/scripts/retrain_all.py

# Smoke test all services
bash ai/scripts/test_services.sh
```

### API docs
FastAPI auto-generates Swagger UI at `http://localhost:800x/docs` for each service.

For the current chatbot MVP:

- AI service docs: `http://localhost:8002/docs`
- Backend proxy endpoint: `POST http://localhost:3000/api/v1/ai/chatbot/chat`
- Frontend page: `http://localhost:5173/ai-assistant`

---

## Key Design Decisions

| Decision | Reason |
|----------|--------|
| Separate microservices per feature | Independent deploy/restart; backend team never touches Python |
| `text-embedding-3-small` | Cheap ($0.02/1M tokens), 1536-dim, excellent quality |
| Chroma (local) → Pinecone (prod) | Zero Docker dependency in dev; swap via env var |
| GPT-4o-mini for sentiment | 10× cheaper than GPT-4o; classification quality is acceptable |
| `implicit` ALS | Industry standard for implicit feedback; serializes to small .pkl |
| In-memory sessions for chatbot | No Redis required for MVP |
| Data-hungry features built last | Search and chatbot demo value on Day 3; recommendations need weeks of order data |
