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


@pytest.fixture(autouse=True)
def _clear_sessions():
    yield
    main.sessions.clear()


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
