# Arman's Development Flow — Online Restaurant Platform

**Role:** Front-end Engineer  
**Date:** 2026-05-12  
**Project:** Online Restaurant Ordering Platform (team of 4 engineers)

---

## Project Overview

Built a full-stack online restaurant ordering platform as part of a 4-person team. The platform allows users to browse restaurants, view menus, and place food orders. Each engineer worked independently in their own folder using AI-assisted development (vibecoding).

---

## Team Structure

| Role | Folder |
|------|--------|
| Back-end Engineer | `backend/` |
| Front-end Engineer (me) | `frontend/` |
| AI Engineer | `ai/` |
| Q&A Engineer | `qa/` |

---

## Step 1 — Project Planning with Multi-Agent AI

### What I did
Used **Claude Code** with 4 specialized AI agents running **in parallel** to generate separate technical plans for each team member.

### Agents used simultaneously
- **Backend Architect agent** → generated `backend/PLAN.md`
- **AI Engineer agent** → generated `ai/PLAN.md`
- **Frontend Developer agent** → generated `frontend/PLAN.md`
- **API Tester agent** → generated `qa/PLAN.md`

### What each plan covered
Every `PLAN.md` file contained:
- Tech stack with rationale
- Full folder structure
- Data models / API endpoints / component lists
- Step-by-step implementation order
- Environment variables
- How to run locally

### Output
Four detailed markdown plan files committed to GitHub — one per engineer — so each person had a standalone instruction document to follow while vibecoding.

---

## Step 2 — Frontend Implementation with 2 Agents in Parallel

### What I did
Used **2 specialized agents running simultaneously** to design and build the entire frontend:

### Agent 1: UI Designer agent
**Task:** Create a complete design system document  
**Output:** `frontend/DESIGN_SYSTEM.md`  
**Covered:**
- Brand identity: "FoodHub" with warm, modern personality
- Color palette with exact Tailwind class names (orange/amber primary, gray backgrounds)
- Typography scale (Inter font, heading sizes, price display)
- Component-level visual specs for every UI element
- `tailwind.config.ts` theme override for shadcn/ui
- Skeleton loader patterns
- Responsive breakpoint rules per page

### Agent 2: Frontend Developer agent
**Task:** Build the complete React application from scratch  
**Output:** 50 source files across `frontend/src/`  
**Built:**
- Config files: `vite.config.ts`, `tailwind.config.ts`, `tsconfig.json`, `package.json`
- TypeScript types: all domain interfaces (Restaurant, MenuItem, Order, etc.)
- Zustand stores: auth store + cart store (both persisted to localStorage)
- Axios API layer with JWT Bearer interceptor and 401 auto-logout
- TanStack Query hooks for all data fetching
- 15 React components (Navbar, CartDrawer, MenuItemModal, RestaurantGrid, etc.)
- 7 pages: Home, RestaurantDetail, Checkout, OrderConfirmation, OrderHistory, Login, 404

### Tech stack used
- React 18 + Vite + TypeScript
- Tailwind CSS v3
- shadcn/ui components
- Zustand (cart + auth state, persisted)
- TanStack Query v5 (server state)
- React Router v6
- Axios (HTTP client)
- React Hook Form + Zod (form validation)
- lucide-react (icons)
- Sonner (toast notifications)

---

## Step 3 — Auth Decision

### What I decided
Changed the authentication requirement from "required everywhere" to **only required when placing an order**.

### Why
Users should be able to browse restaurants and menus freely without logging in. Auth only gates the actual order submission.

### How it was implemented
- Removed `AuthGuard` wrapper from all routes in `App.tsx`
- Added an auth check inside `CheckoutPage.tsx` at the form submit handler
- If not authenticated: shows a toast "Please sign in to place an order" and redirects to `/login?redirect=/checkout`
- After login, user is bounced back to `/checkout` automatically

---

## Step 4 — Running the Backend (Team Collaboration)

### What happened
The backend engineer (teammate) pushed a fully working Express + TypeScript + Prisma backend. I pulled it and attempted to run it.

### Issues encountered and resolved

**Issue 1: Missing `.env` file**  
The backend required environment variables (`DATABASE_URL`, `JWT_SECRET`, etc.) but no `.env` file was committed (correctly, since it's gitignored). Created it manually.

**Issue 2: PostgreSQL port conflict**  
A local Windows PostgreSQL installation was running on port 5432. Docker was also mapped to 5432, causing Prisma to connect to the wrong database with wrong credentials.  
**Fix:** Restarted the Docker container on port **5433** and updated `DATABASE_URL` accordingly.

**Issue 3: `dotenv` not loaded in `config.ts`**  
The backend's config file read `process.env` without loading the `.env` file first. Since I was not allowed to modify the backend, I set environment variables directly in the PowerShell session before running `npm run dev`.

### Commands used
```bash
# Start PostgreSQL via Docker on port 5433
docker run --name restaurant-pg -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=restaurant_db -p 5433:5432 -d postgres:16-alpine

# Run Prisma migrations
npm run db:migrate

# Start backend dev server
npm run dev
```

---

## Step 5 — Frontend ↔ Backend Integration

### What I did
After pulling the backend, I read all backend route files, service files, and response shapes to find mismatches with the frontend API layer.

### Mismatches found and fixed (frontend only)

| # | File | Problem | Fix |
|---|------|---------|-----|
| 1 | `src/api/menu.ts` | URL was `/menu`, backend serves `/menu-items` | Changed to `/restaurants/${id}/menu-items` |
| 2 | `src/types/index.ts` | `OrderItem.name` doesn't exist in backend response | Made `name` optional (`name?: string`) |
| 3 | `src/types/index.ts` | `Restaurant` type missing `menuItems` field | Added `menuItems?: MenuItem[]` |
| 4 | `src/components/order/OrderSummary.tsx` | Used `item.name` which could be undefined | Added fallback: `item.name ?? 'Item #' + id` |
| 5 | `src/pages/OrderHistoryPage.tsx` | Same `item.name` issue | Same fallback applied |

### Key backend facts discovered
- All restaurant and menu endpoints are **public** (no auth required)
- Only **order endpoints** require a JWT — perfectly matching the frontend's auth strategy
- `OrderItem` only stores `menuItemId`, `quantity`, `unitPrice` — no item name in the response
- Backend returns `menuItems` array embedded in restaurant detail response

---

## Step 6 — Git Workflow

All work was version-controlled on GitHub at `github.com/abdraymd/online-restaurant`.

### Commits made
```
Initial commit                          — empty repo setup
Add role-specific PLAN.md files         — 4 engineer plans
Build complete React frontend           — 50 source files
Fix frontend to match backend API       — 5 integration fixes
```

### Branch strategy
All work done on `main` branch. Used `git pull --rebase` to integrate teammate commits cleanly.

---

## Tools and Technologies Summary

| Tool | Purpose |
|------|---------|
| Claude Code (CLI) | AI-assisted development environment |
| Multi-agent parallel execution | Generate 4 plans simultaneously |
| UI Designer agent | Design system specification |
| Frontend Developer agent | Build complete React app |
| Git + GitHub | Version control and collaboration |
| Docker | PostgreSQL database in container |
| Node.js 20 + npm | JavaScript runtime |
| React 18 + Vite | Frontend framework and build tool |
| TypeScript | Type safety across the codebase |
| Tailwind CSS | Utility-first styling |
| Zustand | Client state management |
| TanStack Query | Server state / data fetching |
| Axios | HTTP requests with interceptors |
| Prisma (backend) | ORM and database migrations |
| PostgreSQL | Relational database |

---

## What I Learned

1. **Parallel agents save time** — Running UI Designer and Frontend Developer simultaneously meant design specs and code were produced at the same time rather than sequentially.

2. **Reading backend code before integrating** — Before writing any integration code, I read all backend router, service, and schema files. This revealed the URL mismatch and missing `name` field before they caused runtime bugs.

3. **Auth should match user experience** — Requiring auth to browse restaurants creates friction. The right pattern is to let users explore freely and only gate the transaction (placing an order).

4. **Local environment conflicts are common** — The Docker + local PostgreSQL port conflict is a real-world problem. Understanding which process owns a port is essential for debugging database connection errors.

5. **Planning documents pay off** — Having a detailed `PLAN.md` per engineer meant each person could work independently without constant coordination, which is the point of vibecoding with AI assistance.
