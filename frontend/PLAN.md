# Frontend Plan — Online Restaurant Ordering Platform

## 1. Tech Stack

| Concern | Choice | Rationale |
|---------|--------|-----------|
| Framework | React 18 + Vite + TypeScript | Fast DX, strict types prevent runtime bugs |
| Styling | Tailwind CSS v3 | Utility-first, no context-switching to CSS files |
| Components | shadcn/ui | Copy-paste accessible primitives you own outright |
| State (client) | Zustand | Zero-boilerplate store; persisted to localStorage |
| State (server) | TanStack Query v5 | Caching, loading/error states, background refetch |
| Routing | React Router v6 | Standard, nested routes, protected route pattern |
| HTTP | Axios | Interceptors for auth token injection + 401 handling |
| Forms | React Hook Form + Zod | Performant, schema-validated forms |
| Icons | lucide-react | Tree-shakeable, consistent icon set |

---

## 2. Folder Structure

```
frontend/
├── public/
│   └── favicon.ico
├── src/
│   ├── main.tsx               # App bootstrap
│   ├── App.tsx                # Router setup
│   ├── api/
│   │   ├── client.ts          # Axios instance with auth interceptor
│   │   ├── restaurants.ts     # Typed fetchers for restaurant endpoints
│   │   ├── menu.ts            # Typed fetchers for menu endpoints
│   │   ├── orders.ts          # Typed fetchers for order endpoints
│   │   └── auth.ts            # Typed fetchers for auth endpoints
│   ├── components/
│   │   ├── restaurant/
│   │   │   ├── RestaurantCard.tsx
│   │   │   ├── RestaurantGrid.tsx
│   │   │   └── CategoryFilter.tsx
│   │   ├── menu/
│   │   │   ├── MenuItemCard.tsx
│   │   │   └── MenuItemModal.tsx
│   │   ├── cart/
│   │   │   ├── CartDrawer.tsx
│   │   │   └── CartItem.tsx
│   │   ├── order/
│   │   │   ├── OrderSummary.tsx
│   │   │   └── OrderStatusBadge.tsx
│   │   └── shared/
│   │       ├── Navbar.tsx
│   │       ├── Footer.tsx
│   │       ├── SearchBar.tsx
│   │       ├── AuthGuard.tsx
│   │       └── LoadingSpinner.tsx
│   ├── hooks/
│   │   ├── useCart.ts          # Cart store selectors + actions
│   │   ├── useAuth.ts          # Auth store selectors + actions
│   │   ├── useRestaurants.ts   # TanStack Query hooks for restaurants
│   │   ├── useMenu.ts          # TanStack Query hooks for menu items
│   │   └── useOrders.ts        # TanStack Query hooks for orders
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── RestaurantPage.tsx
│   │   ├── CheckoutPage.tsx
│   │   ├── OrderConfirmationPage.tsx
│   │   ├── OrderHistoryPage.tsx
│   │   ├── LoginPage.tsx
│   │   └── NotFoundPage.tsx
│   ├── store/
│   │   ├── cartStore.ts        # Zustand cart store (persisted)
│   │   └── authStore.ts        # Zustand auth store (persisted)
│   ├── types/
│   │   └── index.ts            # Shared TypeScript interfaces
│   └── lib/
│       └── utils.ts            # cn() helper, price formatters, etc.
├── .env.local                  # Never commit
├── .env.example                # Committed template
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── PLAN.md
```

---

## 3. Pages / Routes

| Route | Component | Auth Required | Purpose |
|-------|-----------|---------------|---------|
| `/` | HomePage | No | Browse + search restaurants |
| `/restaurants/:id` | RestaurantPage | No | Restaurant detail + menu |
| `/checkout` | CheckoutPage | Yes | Review cart + place order |
| `/orders/confirmation/:id` | OrderConfirmationPage | Yes | Post-order success screen |
| `/orders` | OrderHistoryPage | Yes | User's past orders |
| `/login` | LoginPage | No | Login + register tabs |
| `*` | NotFoundPage | No | 404 fallback |

Protected routes (`/checkout`, `/orders/*`) use `<AuthGuard>` which redirects to `/login?redirect=<current-path>` and bounces back after login.

---

## 4. Key Components

| Component | Responsibility |
|-----------|----------------|
| `RestaurantCard` | Displays restaurant name, cuisine, rating, open/closed badge; navigates to detail on click |
| `RestaurantGrid` | Renders a responsive grid of RestaurantCards; shows skeleton loaders during fetch |
| `SearchBar` | Debounced input (300 ms); updates URL query param `?search=`; no prop drilling |
| `CategoryFilter` | Horizontal scrollable chip list for menu categories; highlights active category |
| `MenuItemCard` | Shows item name, price, description, image; "Add to Cart" button opens MenuItemModal |
| `MenuItemModal` | shadcn Dialog; quantity selector; calls `cartStore.addItem()`; closes on confirm |
| `CartDrawer` | shadcn Sheet slide-over; lists CartItems; shows subtotal; "Checkout" CTA; accessible |
| `CartItem` | Single cart row; quantity stepper; remove button |
| `OrderSummary` | Read-only order breakdown with itemized prices and total |
| `OrderStatusBadge` | Color-coded badge (PENDING=yellow, CONFIRMED=blue, DELIVERED=green, CANCELLED=red) |
| `CheckoutForm` | React Hook Form; delivery address fields; payment method selector (mock); submit |
| `Navbar` | Logo, search bar (on home), cart icon with badge count, user menu / login link |
| `Footer` | Static footer with links |
| `AuthGuard` | Wrapper that checks `authStore.token`; redirects if missing |
| `LoadingSpinner` | Centered animated spinner; used by TanStack Query loading states |

---

## 5. State Management

### Zustand Cart Store (`store/cartStore.ts`)

```ts
interface CartState {
  restaurantId: string | null
  items: CartItem[]             // { menuItemId, name, price (cents), quantity }
  addItem: (item) => void       // warns if adding from a different restaurant
  removeItem: (menuItemId) => void
  updateQuantity: (menuItemId, quantity) => void
  clearCart: () => void
  totalCents: () => number      // derived
  itemCount: () => number       // derived
}
```

- Persisted to `localStorage` via Zustand persist middleware — cart survives page refresh
- Prices stored as **integers in cents** to avoid floating-point rounding bugs
- Adding an item from a different restaurant triggers a confirmation dialog before clearing the existing cart

### Zustand Auth Store (`store/authStore.ts`)

```ts
interface AuthState {
  token: string | null
  user: { id, name, email, role } | null
  setAuth: (token, user) => void
  clearAuth: () => void
}
```

- Persisted to `localStorage` — user stays logged in across sessions
- `clearAuth()` is called automatically by the Axios 401 response interceptor

---

## 6. API Integration

### Axios Instance (`src/api/client.ts`)

```ts
const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,  // http://localhost:3000/api/v1
})

// Request interceptor: attach Bearer token from authStore
client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response interceptor: auto-logout on 401
client.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

### Typed Fetchers

```ts
// api/restaurants.ts
export const getRestaurants = (params) =>
  client.get<PaginatedResponse<Restaurant>>('/restaurants', { params }).then(r => r.data)

export const getRestaurant = (id: string) =>
  client.get<Restaurant>(`/restaurants/${id}`).then(r => r.data)

// api/orders.ts
export const placeOrder = (body: PlaceOrderDto) =>
  client.post<Order>('/orders', body).then(r => r.data)
```

### TanStack Query Hooks

```ts
// hooks/useRestaurants.ts
export const useRestaurants = (params) =>
  useQuery({ queryKey: ['restaurants', params], queryFn: () => getRestaurants(params) })

// hooks/useOrders.ts
export const usePlaceOrder = () =>
  useMutation({
    mutationFn: placeOrder,
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      navigate(`/orders/confirmation/${order.id}`)
    },
  })
```

---

## 7. Step-by-Step Implementation Order

### Phase 1 — Project Scaffold (Day 1)
1. `npm create vite@latest frontend -- --template react-ts`
2. Install deps: `tailwindcss`, `@tailwindcss/vite`, `shadcn`, `zustand`, `@tanstack/react-query`, `react-router-dom`, `axios`, `react-hook-form`, `@hookform/resolvers`, `zod`, `lucide-react`
3. Initialize Tailwind (`npx tailwindcss init`) and shadcn (`npx shadcn init`)
4. Create `.env.local` and `.env.example`
5. Set up `vite.config.ts` with `@` path alias

### Phase 2 — Types + API Layer (Day 1)
6. Define all shared TypeScript interfaces in `src/types/index.ts` (Restaurant, MenuItem, Order, User, PaginatedResponse, etc.)
7. Create `src/api/client.ts` — Axios instance with both interceptors
8. Create stub fetchers in `api/auth.ts`, `api/restaurants.ts`, `api/menu.ts`, `api/orders.ts`

### Phase 3 — Stores (Day 1)
9. Implement `store/authStore.ts` with Zustand persist
10. Implement `store/cartStore.ts` with Zustand persist (prices in cents, single-restaurant enforcement)

### Phase 4 — Router + Layout Shell (Day 2)
11. Create `App.tsx` with React Router routes and `<AuthGuard>` wrappers
12. Create `Navbar.tsx` (cart badge wired to cartStore.itemCount)
13. Create `Footer.tsx`, `AuthGuard.tsx`, `NotFoundPage.tsx`

### Phase 5 — Auth Pages (Day 2)
14. Create `LoginPage.tsx` — tabs for Login and Register
15. Implement `useAuth.ts` hooks calling `api/auth.ts`
16. On success: call `authStore.setAuth(token, user)`, redirect to `?redirect` param or `/`

### Phase 6 — Home Page (Days 2–3)
17. Implement `useRestaurants.ts` TanStack Query hook
18. Create `SearchBar.tsx` with 300 ms debounce + URL `?search=` sync
19. Create `RestaurantCard.tsx` + `RestaurantGrid.tsx` with skeleton loaders
20. Wire `HomePage.tsx` — fetch restaurants, render grid, pass search to URL

### Phase 7 — Restaurant Detail + Menu (Day 3)
21. Implement `useMenu.ts` TanStack Query hook
22. Create `CategoryFilter.tsx`
23. Create `MenuItemCard.tsx`
24. Create `MenuItemModal.tsx` with quantity selector + cart action
25. Wire `RestaurantPage.tsx` — fetch restaurant + menu, render with category filter

### Phase 8 — Cart (Day 4)
26. Create `CartItem.tsx` (quantity stepper + remove)
27. Create `CartDrawer.tsx` (shadcn Sheet) wired to cartStore
28. Wire cart icon in `Navbar.tsx` to open CartDrawer and show badge count

### Phase 9 — Checkout (Day 4)
29. Create `CheckoutForm.tsx` with React Hook Form + Zod validation
30. Create `OrderSummary.tsx`
31. Wire `CheckoutPage.tsx` — pre-fill from cartStore, call `usePlaceOrder`, clear cart on success

### Phase 10 — Post-Order + History (Day 5)
32. Create `OrderStatusBadge.tsx`
33. Wire `OrderConfirmationPage.tsx` — fetch order by ID, show confirmation
34. Implement `useOrders.ts` hooks
35. Wire `OrderHistoryPage.tsx` — paginated list of past orders with status badges

### Phase 11 — Error States + Polish (Day 5)
36. Add empty states to RestaurantGrid ("No restaurants found") and OrderHistoryPage ("No orders yet")
37. Add toast notifications (shadcn Toaster) for order success, cart actions, errors
38. Add `LoadingSpinner` to all TanStack Query loading states
39. Ensure keyboard navigation works (Tab order, focus management in modals)

### Phase 12 — Final Check (Day 6)
40. `npm run build` — zero TypeScript errors
41. Test golden path: register → browse → add items → checkout → confirm
42. Test on mobile viewport (375px) — no horizontal overflow
43. Test with empty cart, unauthenticated access, unavailable items

---

## 8. Environment Variables

```dotenv
# frontend/.env.local (never commit)

VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_AI_API_BASE_URL=http://localhost:8001
```

Create `frontend/.env.example` with same keys and placeholder values — commit it, not `.env.local`.

---

## 9. How to Run Locally

### Prerequisites
- Node.js 20 LTS, npm 10+
- Backend running on port 3000

```bash
cd frontend
npm install
npm run dev        # Vite dev server at http://localhost:5173
```

### Build for Production
```bash
npm run build      # Output in dist/
npm run preview    # Preview production build locally
```

---

## Key Design Decisions

| Decision | Reason |
|----------|--------|
| Zustand over Redux | Zero boilerplate; perfect for cart + auth scope |
| TanStack Query over raw useEffect | Built-in caching, loading/error states, deduplication |
| Prices in cents (integers) | Floating-point arithmetic causes display bugs |
| shadcn/ui | You own the code; accessible by default; no black-box library updates |
| CartDrawer (slide-over) | Keeps user on menu while managing cart — better UX than navigating to a cart page |
| Single Axios instance | One place to set auth headers and handle 401 — no duplicate logic across fetchers |
| All components as named exports | Easier to import, refactor, and mock in tests |
