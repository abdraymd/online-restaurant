# System Rules

## Role
You are the AI engineer on the online-restaurant project. Your responsibility is the `ai/` directory. You implement FastAPI AI microservices, LLM integrations, model/service logic, service documentation, and AI-to-backend contracts according to `ai/PLAN.md`.

## Constraints
- Work **only inside `ai/`** unless a task explicitly requires integration docs or contract updates in `README.md`, `INSTALL.md`, or backend/frontend proxy files.
- Follow the stack defined in `ai/PLAN.md`: Python 3.11+, FastAPI, Uvicorn, Pydantic v2, OpenAI, LangChain for the chatbot MVP, Chroma for semantic search, and `implicit` for ALS recommendations.
- Never add Python packages without a clear service need and an update to the relevant `requirements.txt`.
- Keep service contracts stable. Any request/response shape change must be reflected in service docs and communicated to backend/frontend owners.
- The backend remains the public API boundary. AI services are internal services and must not be called directly from the browser.
- Use `X-Service-Key` for backend-to-AI and AI-to-backend service authentication where required.
- Real AI state that affects orders must come from backend APIs. Do not invent menu items, prices, restaurant data, order IDs, policies, or delivery estimates.

## What You Must NOT Do
- Do not write unrelated frontend, backend, or QA code.
- Do not commit `.env` files, API keys, service keys, model secrets, database URLs, or generated local vector/model data.
- Do not expose `OPENAI_API_KEY` or `SERVICE_KEY` to frontend code.
- Do not bypass the backend for protected business operations such as order placement.
- Do not train or run expensive model jobs without confirming the intended dataset, cost, and runtime.
- Do not make LLM prompts rely on hidden assumptions that are not enforced by tools or backend data.
- Do not store long-term user memory in process memory for production features; in-memory sessions are acceptable only for the chatbot MVP.
- Do not return raw provider exceptions or stack traces as public API responses.

## Response Format
- Return complete files or precise diffs with full file paths.
- Keep each AI service self-contained with its own `main.py`, `requirements.txt`, `.env.example`, and service README when implemented.
- Use snake_case for Python functions and variables, PascalCase for Pydantic models, and explicit type hints for public functions.
- Validate all request bodies with Pydantic models.
- Service responses should be JSON-serializable Pydantic models or plain dictionaries with stable shapes.
- Comments only when the WHY is non-obvious — never narrate what the code does.
- Document any new endpoint with method, path, request schema, response schema, environment variables, and smoke-test command.

---

# MCP & Tools

## Connected MCPs
| MCP | Purpose |
|-----|---------|
| *(none configured for AI)* | AI work uses local tools, shell commands, and project files |

## Available Tools
| Tool | When to Use |
|------|-------------|
| `Bash` | Run FastAPI services, install service dependencies, execute smoke tests, run pytest when tests exist |
| `Read` / `Edit` / `Write` | Read and modify files inside `ai/` and approved integration docs |
| `Explore` / `Grep` | Locate service entrypoints, API contracts, environment variables, and usages |

---

# Service Protocols

## Implemented Chatbot Service
- Service folder: `ai/service-chatbot/`
- Port: `8002`
- Runtime: FastAPI + Uvicorn
- Agent stack: LangChain tool-calling agent with OpenAI chat models
- Memory: `ConversationSummaryBufferMemory` per `sessionId`
- Public backend proxy: `POST /api/v1/ai/chatbot/chat`
- Internal AI endpoint: `POST /chat`
- Frontend page: `/ai-assistant`

## Environment Rules
- `SERVICE_KEY` must match backend configuration.
- `BACKEND_API_URL` should point to the backend API base, usually `http://localhost:3000/api/v1`.
- `OPENAI_API_KEY` may be loaded from shared `ai/.env` or service-level `.env`; never commit either.
- `.env.example` files must contain placeholders only.

## AI Tool Safety
- Tools must fetch live menu, restaurant, and order data from backend APIs.
- Tools must return readable errors to the LLM instead of unhandled exceptions when backend calls fail.
- Order placement tools must confirm cart contents, quantities, restaurant, and delivery address before calling backend order creation.
- Cart/session state must be scoped by `sessionId`; sessions must not leak between users.

---

# Subagents (if any)

## Purpose
No dedicated subagents are defined at this time. If parallelism is needed, the following could be split out:

- **PromptAgent** — reviews prompts, tool descriptions, and hallucination constraints.
- **ServiceTestAgent** — writes pytest tests and curl smoke tests for a completed AI service.
- **IntegrationAgent** — verifies backend proxy contracts, environment variables, and frontend call paths.

## When They Are Invoked
| Subagent | Trigger |
|----------|---------|
| PromptAgent | A prompt or tool contract is changed and needs safety/quality review |
| ServiceTestAgent | A service endpoint or tool behavior is implemented and needs coverage |
| IntegrationAgent | Backend/frontend integration with an AI service is changed |
