import os
import time
from typing import Any, Literal

import requests
from dotenv import dotenv_values, load_dotenv
from fastapi import Depends, FastAPI, Header, HTTPException
from langchain_classic.agents import AgentExecutor, create_tool_calling_agent
from langchain_classic.memory import ConversationSummaryBufferMemory
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field

SERVICE_DIR = os.path.dirname(__file__)
SHARED_ENV = dotenv_values(os.path.join(SERVICE_DIR, "..", ".env"))
SERVICE_ENV = dotenv_values(os.path.join(SERVICE_DIR, ".env"))
load_dotenv(os.path.join(SERVICE_DIR, "..", ".env"))
load_dotenv(os.path.join(SERVICE_DIR, ".env"))


def env_value(name: str, default: str = "") -> str:
    service_value = str(SERVICE_ENV.get(name) or "")
    shared_value = str(SHARED_ENV.get(name) or "")
    if service_value and not service_value.startswith(("sk-your", "replace_with")):
        return service_value
    return shared_value or os.getenv(name, default)

SERVICE_KEY = env_value("SERVICE_KEY")
BACKEND_API_URL = env_value("BACKEND_API_URL", "http://localhost:3000/api/v1").rstrip("/")
OPENAI_CHAT_MODEL = env_value("OPENAI_CHAT_MODEL", "gpt-4o")
SESSION_TTL_SECONDS = 30 * 60

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
    expired = [key for key, value in sessions.items() if key != "_current" and now - value["updatedAt"] > SESSION_TTL_SECONDS]
    for key in expired:
        del sessions[key]
    if session_id not in sessions:
        sessions[session_id] = {"messages": [], "cart": [], "updatedAt": now}
    sessions[session_id]["updatedAt"] = now
    return sessions[session_id]


def current_context() -> dict[str, Any]:
    return sessions["_current"]


def backend_headers() -> dict[str, str]:
    context = current_context()
    headers = {"X-Service-Key": SERVICE_KEY}
    if context.get("authToken"):
        headers["Authorization"] = f"Bearer {context['authToken']}"
    return headers


@tool
def search_menu(query: str) -> str:
    """Search menu items by a customer's natural language query."""
    context = current_context()
    if not context.get("restaurantId"):
        return "No restaurantId was provided."
    params = {"query": query, "restaurantId": context.get("restaurantId")}
    response = requests.get(f"{BACKEND_API_URL}/menu-items", params=params, headers=backend_headers(), timeout=10)
    if not response.ok:
        return f"Error {response.status_code}: {response.text}"
    return response.text


@tool
def get_restaurant_info() -> str:
    """Get details for the current restaurant."""
    restaurant_id = current_context().get("restaurantId")
    if not restaurant_id:
        return "No restaurantId was provided."
    response = requests.get(f"{BACKEND_API_URL}/restaurants/{restaurant_id}", headers=backend_headers(), timeout=10)
    if not response.ok:
        return f"Error {response.status_code}: {response.text}"
    return response.text


@tool
def add_to_cart(menuItemId: str, quantity: int, name: str = "", price: float = 0, notes: str = "") -> str:
    """Add a menu item to the current session cart."""
    session = current_context()["session"]
    quantity = max(1, quantity)
    session["cart"].append({"menuItemId": menuItemId, "name": name, "quantity": quantity, "price": price, "notes": notes})
    return f"Added {quantity} item(s). Current cart: {session['cart']}"


@tool
def view_cart() -> str:
    """View the current session cart."""
    return str(current_context()["session"]["cart"])


@tool
def place_order(deliveryAddress: str) -> str:
    """Place the current cart as an order after confirming cart contents and delivery address."""
    context = current_context()
    if not context.get("restaurantId"):
        return "No restaurantId was provided."
    session = context["session"]
    if not session["cart"]:
        return "Cart is empty."
    note_parts = [f"Delivery: {deliveryAddress}"]
    for item in session["cart"]:
        if item.get("notes"):
            note_parts.append(f"{item.get('name') or item['menuItemId']}: {item['notes']}")
    payload = {
        "restaurantId": context.get("restaurantId"),
        "items": [{"menuItemId": item["menuItemId"], "quantity": item["quantity"]} for item in session["cart"]],
        "note": ". ".join(note_parts),
    }
    response = requests.post(f"{BACKEND_API_URL}/orders", json=payload, headers=backend_headers(), timeout=15)
    if not response.ok:
        return f"Error {response.status_code}: {response.text}"
    session["cart"] = []
    return response.text


llm = ChatOpenAI(model=OPENAI_CHAT_MODEL, temperature=0, api_key=env_value("OPENAI_API_KEY"))
tools = [search_menu, get_restaurant_info, add_to_cart, view_cart, place_order]
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are an online restaurant ordering assistant. Use tools for menu, restaurant, cart, and order actions. Do not invent menu items, prices, policies, order IDs, or delivery estimates. Confirm items, quantities, restaurant, and delivery address before placing an order.",
        ),
        MessagesPlaceholder("chat_history"),
        ("human", "{input}"),
        MessagesPlaceholder("agent_scratchpad"),
    ]
)
agent = create_tool_calling_agent(llm, tools, prompt)


@app.get("/health")
async def health() -> dict[str, Literal["ok"]]:
    return {"status": "ok"}


@app.post("/chat", response_model=ChatResponse, dependencies=[Depends(require_service_key)])
async def chat(request: ChatRequest) -> ChatResponse:
    session = get_session(request.sessionId)
    sessions["_current"] = {**request.model_dump(), "session": session}
    memory = session.get("memory")
    if memory is None:
        memory = ConversationSummaryBufferMemory(llm=llm, memory_key="chat_history", return_messages=True, max_token_limit=1000)
        session["memory"] = memory
    executor = AgentExecutor(agent=agent, tools=tools, memory=memory, verbose=True)
    old_cart = list(session["cart"])
    result = await executor.ainvoke({"input": request.message})
    reply = result["output"]
    cart_updated = old_cart != session["cart"]
    session["updatedAt"] = time.time()
    return ChatResponse(reply=reply, cartUpdated=cart_updated, cart=session["cart"], sessionId=request.sessionId)
