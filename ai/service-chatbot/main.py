import json
import os
import time
from typing import Any, Literal

import httpx
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, Header, HTTPException
from openai import AsyncOpenAI
from pydantic import BaseModel, Field

load_dotenv()
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

SERVICE_KEY = os.getenv("SERVICE_KEY", "")
BACKEND_API_URL = os.getenv("BACKEND_API_URL", "http://localhost:3000/api/v1").rstrip("/")
OPENAI_CHAT_MODEL = os.getenv("OPENAI_CHAT_MODEL", "gpt-4o")
SESSION_TTL_SECONDS = 30 * 60

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
app = FastAPI(title="Online Restaurant AI Chatbot", version="1.0.0")
sessions: dict[str, dict[str, Any]] = {}


class ChatRequest(BaseModel):
    sessionId: str = Field(..., min_length=1)
    restaurantId: str | None = None
    message: str = Field(..., min_length=1)
    userId: str | None = None
    authToken: str | None = None


class CartItem(BaseModel):
    menuItemId: str
    name: str | None = None
    quantity: int
    price: float | None = None
    notes: str | None = None


class ChatResponse(BaseModel):
    reply: str
    cartUpdated: bool
    cart: list[CartItem]
    sessionId: str


async def require_service_key(x_service_key: str | None = Header(default=None)) -> None:
    if not SERVICE_KEY:
        raise HTTPException(status_code=500, detail="SERVICE_KEY is not configured")
    if x_service_key != SERVICE_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing X-Service-Key")


def get_session(session_id: str) -> dict[str, Any]:
    now = time.time()
    expired = [key for key, value in sessions.items() if now - value["updatedAt"] > SESSION_TTL_SECONDS]
    for key in expired:
        del sessions[key]
    if session_id not in sessions:
        sessions[session_id] = {"messages": [], "cart": [], "updatedAt": now}
    sessions[session_id]["updatedAt"] = now
    return sessions[session_id]


def backend_headers(auth_token: str | None = None) -> dict[str, str]:
    headers = {"X-Service-Key": SERVICE_KEY}
    if auth_token:
        headers["Authorization"] = f"Bearer {auth_token}"
    return headers


async def search_menu(query: str, restaurantId: str | None = None) -> dict[str, Any]:
    params = {"query": query}
    if restaurantId:
        params["restaurantId"] = restaurantId
    async with httpx.AsyncClient(timeout=10) as http:
        response = await http.get(f"{BACKEND_API_URL}/menu-items", params=params, headers=backend_headers())
    if response.status_code >= 400:
        return {"ok": False, "error": response.text, "items": []}
    data = response.json()
    items = data.get("items", data if isinstance(data, list) else data.get("data", []))
    return {"ok": True, "items": items}


async def get_restaurant_info(restaurantId: str) -> dict[str, Any]:
    async with httpx.AsyncClient(timeout=10) as http:
        response = await http.get(f"{BACKEND_API_URL}/restaurants/{restaurantId}", headers=backend_headers())
    if response.status_code >= 400:
        return {"ok": False, "error": response.text}
    return {"ok": True, "restaurant": response.json()}


def add_to_cart(session: dict[str, Any], menuItemId: str, quantity: int, name: str | None = None, price: float | None = None, notes: str | None = None) -> dict[str, Any]:
    quantity = max(1, quantity)
    for item in session["cart"]:
        if item["menuItemId"] == menuItemId and item.get("notes") == notes:
            item["quantity"] += quantity
            return {"ok": True, "cartUpdated": True, "cart": session["cart"]}
    session["cart"].append({"menuItemId": menuItemId, "name": name, "quantity": quantity, "price": price, "notes": notes})
    return {"ok": True, "cartUpdated": True, "cart": session["cart"]}


def view_cart(session: dict[str, Any]) -> dict[str, Any]:
    return {"ok": True, "cart": session["cart"]}


async def place_order(session: dict[str, Any], deliveryAddress: str, restaurantId: str | None = None, userId: str | None = None, authToken: str | None = None) -> dict[str, Any]:
    if not session["cart"]:
        return {"ok": False, "error": "Cart is empty"}
    payload = {
        "restaurantId": restaurantId,
        "userId": userId,
        "deliveryAddress": deliveryAddress,
        "items": [{"menuItemId": item["menuItemId"], "quantity": item["quantity"], "notes": item.get("notes")} for item in session["cart"]],
    }
    async with httpx.AsyncClient(timeout=15) as http:
        response = await http.post(f"{BACKEND_API_URL}/orders", json=payload, headers=backend_headers(authToken))
    if response.status_code >= 400:
        return {"ok": False, "error": response.text, "cart": session["cart"]}
    order = response.json()
    session["cart"] = []
    return {"ok": True, "order": order, "cartUpdated": True, "cart": []}


TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "search_menu",
            "description": "Search restaurant menu items by natural language query.",
            "parameters": {
                "type": "object",
                "properties": {"query": {"type": "string"}, "restaurantId": {"type": "string"}},
                "required": ["query"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "add_to_cart",
            "description": "Add a specific menu item to the user's in-memory cart.",
            "parameters": {
                "type": "object",
                "properties": {
                    "menuItemId": {"type": "string"},
                    "quantity": {"type": "integer", "minimum": 1},
                    "name": {"type": "string"},
                    "price": {"type": "number"},
                    "notes": {"type": "string"},
                },
                "required": ["menuItemId", "quantity"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "view_cart",
            "description": "View the current session cart.",
            "parameters": {"type": "object", "properties": {}},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_restaurant_info",
            "description": "Fetch restaurant details including menu, hours, and delivery information when available.",
            "parameters": {
                "type": "object",
                "properties": {"restaurantId": {"type": "string"}},
                "required": ["restaurantId"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "place_order",
            "description": "Place the current cart as an order through the backend API after confirming address and details.",
            "parameters": {
                "type": "object",
                "properties": {"deliveryAddress": {"type": "string"}},
                "required": ["deliveryAddress"],
            },
        },
    },
]


SYSTEM_PROMPT = """
You are an AI ordering assistant for an online restaurant platform.
Help customers find menu items, build a cart, answer restaurant questions, and place orders.
Use tools whenever live menu, restaurant, cart, or order state is needed.
Do not invent menu items, prices, restaurant policies, order IDs, or delivery estimates.
Before placing an order, confirm the selected items, quantities, restaurant, and delivery address.
If required information is missing, ask a short follow-up question.
""".strip()


async def execute_tool(name: str, args: dict[str, Any], request: ChatRequest, session: dict[str, Any]) -> dict[str, Any]:
    if name == "search_menu":
        return await search_menu(args["query"], args.get("restaurantId") or request.restaurantId)
    if name == "add_to_cart":
        return add_to_cart(session, args["menuItemId"], args["quantity"], args.get("name"), args.get("price"), args.get("notes"))
    if name == "view_cart":
        return view_cart(session)
    if name == "get_restaurant_info":
        return await get_restaurant_info(args.get("restaurantId") or request.restaurantId)
    if name == "place_order":
        return await place_order(session, args["deliveryAddress"], request.restaurantId, request.userId, request.authToken)
    return {"ok": False, "error": f"Unknown tool: {name}"}


@app.get("/health")
async def health() -> dict[str, Literal["ok"]]:
    return {"status": "ok"}


@app.post("/chat", response_model=ChatResponse, dependencies=[Depends(require_service_key)])
async def chat(request: ChatRequest) -> ChatResponse:
    session = get_session(request.sessionId)
    messages = [{"role": "system", "content": SYSTEM_PROMPT}, *session["messages"], {"role": "user", "content": request.message}]
    first = await client.chat.completions.create(model=OPENAI_CHAT_MODEL, messages=messages, tools=TOOLS, tool_choice="auto")
    assistant_message = first.choices[0].message
    cart_updated = False

    if assistant_message.tool_calls:
        messages.append(assistant_message.model_dump(exclude_none=True))
        for tool_call in assistant_message.tool_calls:
            args = json.loads(tool_call.function.arguments or "{}")
            result = await execute_tool(tool_call.function.name, args, request, session)
            cart_updated = cart_updated or bool(result.get("cartUpdated"))
            messages.append({"role": "tool", "tool_call_id": tool_call.id, "content": json.dumps(result)})
        final = await client.chat.completions.create(model=OPENAI_CHAT_MODEL, messages=messages)
        reply = final.choices[0].message.content or "I completed the request."
    else:
        reply = assistant_message.content or "How can I help with your order?"

    session["messages"] = [*session["messages"], {"role": "user", "content": request.message}, {"role": "assistant", "content": reply}][-20:]
    session["updatedAt"] = time.time()
    return ChatResponse(reply=reply, cartUpdated=cart_updated, cart=session["cart"], sessionId=request.sessionId)
