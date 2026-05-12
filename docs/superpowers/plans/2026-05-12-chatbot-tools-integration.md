# Chatbot Tools Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix schema mismatches between the AI chatbot's tools and the backend API so `place_order`, `search_menu`, and `get_restaurant_info` work correctly end-to-end.

**Architecture:** All changes are in `ai/service-chatbot/main.py` only. The `place_order` payload is cleaned up (remove `userId`, remove per-item `notes`, fold `deliveryAddress` + item notes into a single `note` string). `search_menu` and `get_restaurant_info` gain an `response.ok` check so the LLM receives a readable error string instead of raw JSON blobs on failures.

**Tech Stack:** Python 3.11+, FastAPI, LangChain (`@tool`), pytest, `unittest.mock`

---

## Files

| Action | Path |
|--------|------|
| Modify | `ai/service-chatbot/main.py` |
| Create | `ai/service-chatbot/tests/__init__.py` |
| Create | `ai/service-chatbot/tests/test_tools.py` |
| Modify | `ai/service-chatbot/requirements.txt` (add `pytest`) |

---

### Task 1: Add pytest and create test scaffold

**Files:**
- Modify: `ai/service-chatbot/requirements.txt`
- Create: `ai/service-chatbot/tests/__init__.py`
- Create: `ai/service-chatbot/tests/test_tools.py`

- [ ] **Step 1: Add pytest to requirements.txt**

Append one line so `pip install -r requirements.txt` covers the test runner:

```
pytest>=8.0.0
```

Final `requirements.txt`:
```
fastapi==0.115.6
uvicorn[standard]==0.34.0
openai>=2.26.0,<3.0.0
python-dotenv==1.0.1
pydantic==2.10.4
requests==2.32.5
langchain-openai==1.1.12
langchain-core>=1.2.21,<2.0.0
langchain-classic>=1.0.0,<2.0.0
pytest>=8.0.0
```

- [ ] **Step 2: Install the updated deps**

```bash
cd ai/service-chatbot
pip install -r requirements.txt
```

Expected: resolves without errors, `pytest` becomes available.

- [ ] **Step 3: Create empty package marker**

Create `ai/service-chatbot/tests/__init__.py` with empty content.

- [ ] **Step 4: Write the failing test file**

Create `ai/service-chatbot/tests/test_tools.py`:

```python
import os
os.environ.setdefault("OPENAI_API_KEY", "sk-test")
os.environ.setdefault("SERVICE_KEY", "test-key")
os.environ.setdefault("BACKEND_API_URL", "http://test-backend/api/v1")

from unittest.mock import patch, MagicMock
import pytest
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
import main


def _setup(restaurant_id=None, user_id=None, auth_token=None, cart=None):
    """Seed sessions['_current'] as the request handler would."""
    session = {"cart": list(cart or []), "messages": []}
    main.sessions["_current"] = {
        "restaurantId": restaurant_id,
        "userId": user_id,
        "authToken": auth_token,
        "session": session,
    }
    return session


# ── search_menu ───────────────────────────────────────────────────────────────

def test_search_menu_returns_body_on_success():
    _setup(restaurant_id="r1")
    resp = MagicMock(ok=True, text='[{"id":"m1","name":"Pizza"}]')
    with patch("main.requests.get", return_value=resp):
        result = main.search_menu.func("pizza")
    assert "Pizza" in result


def test_search_menu_returns_error_string_on_failure():
    _setup(restaurant_id="r1")
    resp = MagicMock(ok=False, status_code=500, text='{"error":"internal"}')
    with patch("main.requests.get", return_value=resp):
        result = main.search_menu.func("pizza")
    assert "Error 500" in result


# ── get_restaurant_info ───────────────────────────────────────────────────────

def test_get_restaurant_info_returns_body_on_success():
    _setup(restaurant_id="r1")
    resp = MagicMock(ok=True, text='{"id":"r1","name":"Joe\'s"}')
    with patch("main.requests.get", return_value=resp):
        result = main.get_restaurant_info.func()
    assert "Joe" in result


def test_get_restaurant_info_returns_error_string_on_failure():
    _setup(restaurant_id="r1")
    resp = MagicMock(ok=False, status_code=404, text='{"error":"not found"}')
    with patch("main.requests.get", return_value=resp):
        result = main.get_restaurant_info.func()
    assert "Error 404" in result


def test_get_restaurant_info_no_restaurant_id():
    _setup()
    result = main.get_restaurant_info.func()
    assert "No restaurantId" in result


# ── place_order ───────────────────────────────────────────────────────────────

def test_place_order_empty_cart():
    _setup(restaurant_id="r1", cart=[])
    result = main.place_order.func("123 Main St")
    assert "Cart is empty" in result


def test_place_order_payload_excludes_user_id_and_delivery_address():
    cart = [{"menuItemId": "m1", "name": "Burger", "quantity": 2, "price": 10.0, "notes": ""}]
    _setup(restaurant_id="r1", user_id="u1", auth_token="tok", cart=cart)
    resp = MagicMock(ok=True, text='{"id":"o1"}')
    with patch("main.requests.post", return_value=resp) as mock_post:
        main.place_order.func("123 Main St")
    payload = mock_post.call_args[1]["json"]
    assert "userId" not in payload
    assert "deliveryAddress" not in payload
    assert payload["restaurantId"] == "r1"


def test_place_order_items_have_no_notes_field():
    cart = [{"menuItemId": "m1", "name": "Burger", "quantity": 1, "price": 10.0, "notes": "no onions"}]
    _setup(restaurant_id="r1", cart=cart)
    resp = MagicMock(ok=True, text='{"id":"o1"}')
    with patch("main.requests.post", return_value=resp) as mock_post:
        main.place_order.func("123 Main St")
    items = mock_post.call_args[1]["json"]["items"]
    assert all("notes" not in item for item in items)
    assert items == [{"menuItemId": "m1", "quantity": 1}]


def test_place_order_note_contains_delivery_address():
    cart = [{"menuItemId": "m1", "name": "Burger", "quantity": 1, "price": 10.0, "notes": ""}]
    _setup(restaurant_id="r1", cart=cart)
    resp = MagicMock(ok=True, text='{"id":"o1"}')
    with patch("main.requests.post", return_value=resp) as mock_post:
        main.place_order.func("123 Main St")
    note = mock_post.call_args[1]["json"]["note"]
    assert "123 Main St" in note


def test_place_order_note_contains_item_notes():
    cart = [
        {"menuItemId": "m1", "name": "Burger", "quantity": 1, "price": 10.0, "notes": "no onions"},
        {"menuItemId": "m2", "name": "Fries", "quantity": 1, "price": 5.0, "notes": ""},
    ]
    _setup(restaurant_id="r1", cart=cart)
    resp = MagicMock(ok=True, text='{"id":"o1"}')
    with patch("main.requests.post", return_value=resp) as mock_post:
        main.place_order.func("123 Main St")
    note = mock_post.call_args[1]["json"]["note"]
    assert "Burger: no onions" in note
    assert "Fries" not in note  # empty notes not included


def test_place_order_clears_cart_on_success():
    cart = [{"menuItemId": "m1", "name": "Burger", "quantity": 1, "price": 10.0, "notes": ""}]
    session = _setup(restaurant_id="r1", cart=cart)
    resp = MagicMock(ok=True, text='{"id":"o1"}')
    with patch("main.requests.post", return_value=resp):
        main.place_order.func("123 Main St")
    assert session["cart"] == []


def test_place_order_preserves_cart_on_failure():
    cart = [{"menuItemId": "m1", "name": "Burger", "quantity": 1, "price": 10.0, "notes": ""}]
    session = _setup(restaurant_id="r1", cart=cart)
    resp = MagicMock(ok=False, status_code=401, text='{"error":"unauthorized"}')
    with patch("main.requests.post", return_value=resp):
        main.place_order.func("123 Main St")
    assert len(session["cart"]) == 1


def test_place_order_returns_error_string_on_failure():
    cart = [{"menuItemId": "m1", "name": "Burger", "quantity": 1, "price": 10.0, "notes": ""}]
    _setup(restaurant_id="r1", cart=cart)
    resp = MagicMock(ok=False, status_code=401, text='{"error":"unauthorized"}')
    with patch("main.requests.post", return_value=resp):
        result = main.place_order.func("123 Main St")
    assert "Error 401" in result
```

- [ ] **Step 5: Run tests — verify they fail**

```bash
cd ai/service-chatbot && python -m pytest tests/test_tools.py -v
```

Expected: tests that check `"Error 500"`, `"Error 404"`, `"Error 401"`, and payload shape will FAIL because `main.py` doesn't yet return error strings or fix the payload.

---

### Task 2: Fix `search_menu` error handling

**Files:**
- Modify: `ai/service-chatbot/main.py` (lines 80–86)

- [ ] **Step 1: Update `search_menu` in main.py**

Replace:
```python
@tool
def search_menu(query: str) -> str:
    """Search menu items by a customer's natural language query."""
    context = current_context()
    params = {"query": query, "restaurantId": context.get("restaurantId")}
    response = requests.get(f"{BACKEND_API_URL}/menu-items", params=params, headers=backend_headers(), timeout=10)
    return response.text
```

With:
```python
@tool
def search_menu(query: str) -> str:
    """Search menu items by a customer's natural language query."""
    context = current_context()
    params = {"query": query, "restaurantId": context.get("restaurantId")}
    response = requests.get(f"{BACKEND_API_URL}/menu-items", params=params, headers=backend_headers(), timeout=10)
    if not response.ok:
        return f"Error {response.status_code}: {response.text}"
    return response.text
```

- [ ] **Step 2: Run only search_menu tests**

```bash
cd ai/service-chatbot && python -m pytest tests/test_tools.py -k "search_menu" -v
```

Expected: 2 tests PASS.

---

### Task 3: Fix `get_restaurant_info` error handling

**Files:**
- Modify: `ai/service-chatbot/main.py` (lines 89–96)

- [ ] **Step 1: Update `get_restaurant_info` in main.py**

Replace:
```python
@tool
def get_restaurant_info() -> str:
    """Get details for the current restaurant."""
    restaurant_id = current_context().get("restaurantId")
    if not restaurant_id:
        return "No restaurantId was provided."
    response = requests.get(f"{BACKEND_API_URL}/restaurants/{restaurant_id}", headers=backend_headers(), timeout=10)
    return response.text
```

With:
```python
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
```

- [ ] **Step 2: Run only get_restaurant_info tests**

```bash
cd ai/service-chatbot && python -m pytest tests/test_tools.py -k "restaurant_info" -v
```

Expected: 3 tests PASS.

---

### Task 4: Fix `place_order` payload

**Files:**
- Modify: `ai/service-chatbot/main.py` (lines 114–130)

- [ ] **Step 1: Update `place_order` in main.py**

Replace:
```python
@tool
def place_order(deliveryAddress: str) -> str:
    """Place the current cart as an order after confirming cart contents and delivery address."""
    context = current_context()
    session = context["session"]
    if not session["cart"]:
        return "Cart is empty."
    payload = {
        "restaurantId": context.get("restaurantId"),
        "userId": context.get("userId"),
        "deliveryAddress": deliveryAddress,
        "items": [{"menuItemId": item["menuItemId"], "quantity": item["quantity"], "notes": item.get("notes")} for item in session["cart"]],
    }
    response = requests.post(f"{BACKEND_API_URL}/orders", json=payload, headers=backend_headers(), timeout=15)
    if response.ok:
        session["cart"] = []
    return response.text
```

With:
```python
@tool
def place_order(deliveryAddress: str) -> str:
    """Place the current cart as an order after confirming cart contents and delivery address."""
    context = current_context()
    session = context["session"]
    if not session["cart"]:
        return "Cart is empty."
    note_parts = [f"Delivery: {deliveryAddress}"]
    for item in session["cart"]:
        if item.get("notes"):
            note_parts.append(f"{item.get('name', item['menuItemId'])}: {item['notes']}")
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
```

- [ ] **Step 2: Run only place_order tests**

```bash
cd ai/service-chatbot && python -m pytest tests/test_tools.py -k "place_order" -v
```

Expected: all 8 place_order tests PASS.

---

### Task 5: Full test run and commit

- [ ] **Step 1: Run all tests**

```bash
cd ai/service-chatbot && python -m pytest tests/ -v
```

Expected: all 13 tests PASS, 0 failures.

- [ ] **Step 2: Commit**

```bash
git add ai/service-chatbot/main.py \
        ai/service-chatbot/requirements.txt \
        ai/service-chatbot/tests/__init__.py \
        ai/service-chatbot/tests/test_tools.py
git commit -m "fix(chatbot): align tool payloads with backend schema and add error handling"
```
