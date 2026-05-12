# DESIGN SYSTEM — Online Restaurant Ordering Platform

## 1. Brand Identity

**Product name**: ForkReady
**Tagline**: "Order food, skip the wait."
**Personality**: Warm, modern, trustworthy, and appetite-forward. The interface should feel like a well-run restaurant — efficient and pleasant, never clinical or cold.
**Voice**: Friendly but direct. Action-oriented CTAs. Error messages that guide, not shame.
**Visual character**: Clean cards with generous whitespace, warm orange accents that evoke food and energy, neutral grays that keep content readable, soft rounded corners that feel approachable without being cartoonish.

---

## 2. Color Palette

All values are Tailwind v3 utility class names. Use these exclusively — no arbitrary values.

### Primary (CTAs, interactive links, key actions)
| Role | Tailwind class | Usage |
|------|---------------|-------|
| Primary action background | `bg-orange-500` | Buttons, active tabs, "Add to Cart" |
| Primary action hover | `hover:bg-orange-600` | Button hover state |
| Primary action text | `text-orange-500` | Text links, icon accents |
| Primary action ring | `focus-visible:ring-orange-500` | Keyboard focus ring |
| Primary light bg | `bg-orange-50` | Hover surfaces, selected filter pills |
| Primary border | `border-orange-500` | Active filter border, focus border |

### Secondary / Accent
| Role | Tailwind class | Usage |
|------|---------------|-------|
| Accent background | `bg-amber-400` | Rating stars, highlight banners |
| Accent text | `text-amber-500` | Star icons, promotional labels |
| Accent light bg | `bg-amber-50` | Promotional badge backgrounds |

### Backgrounds
| Role | Tailwind class | Usage |
|------|---------------|-------|
| Page background | `bg-gray-50` | Root `<body>` / page wrapper |
| Card background | `bg-white` | RestaurantCard, MenuItemCard, Cart items |
| Input background | `bg-white` | All form inputs |
| Navbar background | `bg-white` | Top navigation bar |
| Drawer background | `bg-white` | CartDrawer Sheet |
| Overlay | `bg-black/50` | Modal and drawer backdrops |
| Divider | `bg-gray-100` | Horizontal rules between sections |

### Text
| Role | Tailwind class | Usage |
|------|---------------|-------|
| Primary text | `text-gray-900` | Headings, restaurant names, prices |
| Secondary text | `text-gray-600` | Descriptions, subtitles, meta info |
| Muted text | `text-gray-400` | Placeholder text, disabled labels |
| Inverted text | `text-white` | Text on colored/dark backgrounds |
| Link text | `text-orange-500` | Inline links |
| Link hover | `hover:text-orange-600` | Link hover state |

### Status Colors (semantic)
| Status | Background | Text | Border | Usage |
|--------|-----------|------|--------|-------|
| Success | `bg-green-50` | `text-green-700` | `border-green-200` | Order delivered, form success |
| Warning | `bg-yellow-50` | `text-yellow-700` | `border-yellow-200` | Restaurant closing soon, stock low |
| Error | `bg-red-50` | `text-red-700` | `border-red-200` | Form errors, failed orders |
| Info | `bg-blue-50` | `text-blue-700` | `border-blue-200` | Estimated delivery time, tips |

### Order Status Badge Colors
Each badge uses shadcn `<Badge>` with a `className` override — no custom variants needed.

| Status | Tailwind classes on `<Badge>` |
|--------|-------------------------------|
| `PENDING` | `bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100` |
| `CONFIRMED` | `bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100` |
| `PREPARING` | `bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100` |
| `READY` | `bg-green-100 text-green-800 border-green-200 hover:bg-green-100` |
| `DELIVERED` | `bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100` |
| `CANCELLED` | `bg-red-100 text-red-800 border-red-200 hover:bg-red-100` |

Apply `variant="outline"` on the shadcn Badge and override with these classes via `cn()`.

---

## 3. Typography

Font stack: Inter (primary), system-ui fallback. Add Inter via Google Fonts or `fontsource/inter`.

```html
<!-- index.html <head> -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
```

### Heading Scale
| Element | Tailwind classes | Usage |
|---------|-----------------|-------|
| h1 — Page title | `text-3xl font-bold text-gray-900 tracking-tight` | HomePage hero, 404 heading |
| h2 — Section title | `text-2xl font-semibold text-gray-900` | "Popular Restaurants", menu category names |
| h3 — Card title | `text-lg font-semibold text-gray-900` | Restaurant name on card, menu item name |
| h4 — Sub-section | `text-base font-semibold text-gray-900` | Order summary section headers, form group labels |

### Body Text
| Role | Tailwind classes | Usage |
|------|-----------------|-------|
| Body regular | `text-sm text-gray-600 leading-relaxed` | Menu item descriptions, address fields |
| Body small | `text-xs text-gray-500 leading-normal` | Cuisine tag, delivery time, item count |
| Caption / meta | `text-xs text-gray-400` | "Updated 5 mins ago", timestamps |

### Price Display
| Role | Tailwind classes | Usage |
|------|-----------------|-------|
| Primary price | `text-lg font-bold text-gray-900` | Menu item price, cart line total |
| Cart total | `text-xl font-bold text-gray-900` | CartDrawer subtotal, checkout grand total |
| Strikethrough old price | `text-sm line-through text-gray-400` | Discounted items |
| Price accent | `text-orange-500 font-semibold` | Min. order amount, delivery fee highlight |

### Misc
| Role | Tailwind classes | Usage |
|------|-----------------|-------|
| Rating | `text-sm font-medium text-gray-700` | "4.7" next to star icon |
| Badge text | `text-xs font-medium` | Applied inside Badge component |
| Button text | `text-sm font-medium` | All button labels (applied via shadcn) |
| Empty state heading | `text-lg font-semibold text-gray-500` | "No restaurants found" |
| Empty state sub | `text-sm text-gray-400` | Helper text under empty state heading |

---

## 4. Spacing & Layout

### Base Unit
All spacing uses the Tailwind 4px base unit. Never use arbitrary values — pick the nearest scale step.

### Spacing Reference
| Token | px | Tailwind class | Typical usage |
|-------|----|---------------|---------------|
| 1 | 4px | `p-1` / `gap-1` | Icon padding, tight badge padding |
| 2 | 8px | `p-2` / `gap-2` | Chip inner padding, icon + label gap |
| 3 | 12px | `p-3` / `gap-3` | Input padding, compact card padding |
| 4 | 16px | `p-4` / `gap-4` | Card padding (default), section gaps |
| 5 | 20px | `p-5` / `gap-5` | — (avoid; prefer 4 or 6) |
| 6 | 24px | `p-6` / `gap-6` | Card padding (large), section headers |
| 8 | 32px | `p-8` / `gap-8` | Page-level section gaps |
| 10 | 40px | `py-10` | Page top/bottom padding |
| 12 | 48px | `py-12` | Hero section vertical padding |
| 16 | 64px | `py-16` | Large breakpoint section padding |

### Container
```
max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
```
Use this wrapper on every page's root `<div>`. It keeps content comfortably readable on wide screens.

### Grid System

| Layout | Tailwind classes |
|--------|-----------------|
| Restaurant grid | `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6` |
| Menu items | `grid grid-cols-1 md:grid-cols-2 gap-4` |
| Checkout 2-col (form + summary) | `grid grid-cols-1 lg:grid-cols-3 gap-8` — form takes `lg:col-span-2` |
| Order history list | `flex flex-col gap-4` |
| Auth form (centered) | `max-w-md mx-auto` |

### Vertical Rhythm between Sections
- Between navbar and first content: `pt-8`
- Between page title and content grid: `mt-6`
- Between section heading and its content: `mt-4`
- Between major page sections: `mb-12`

---

## 5. Component Visual Specs

### RestaurantCard

Layout: vertical card with image top, content bottom.

```
rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm
hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer
```

| Part | Tailwind classes |
|------|-----------------|
| Card wrapper | `rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer` |
| Image container | `relative aspect-[16/9] w-full overflow-hidden bg-gray-100` |
| Image | `w-full h-full object-cover transition-transform duration-300 group-hover:scale-105` |
| Open/Closed badge | `absolute top-3 left-3` — shadcn Badge with `bg-green-500 text-white` (open) or `bg-gray-500 text-white` (closed) |
| Cuisine badge | `absolute top-3 right-3` — shadcn Badge with `bg-white/90 text-gray-700 backdrop-blur-sm` |
| Content padding | `p-4` |
| Restaurant name | `text-lg font-semibold text-gray-900 truncate` |
| Meta row (rating + time) | `flex items-center gap-3 mt-1` |
| Star icon | `w-4 h-4 text-amber-400 fill-amber-400` (lucide `Star`) |
| Rating value | `text-sm font-medium text-gray-700` |
| Dot separator | `text-gray-300` |
| Delivery time | `text-sm text-gray-500` |
| Min. order | `text-xs text-gray-400 mt-1` |

Wrap the card `<div>` in `<Link to={/restaurants/${id}} className="group block">`.

---

### MenuItemCard

Layout: horizontal — image on the right, content on the left. Fills the full card width.

| Part | Tailwind classes |
|------|-----------------|
| Card wrapper | `flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-orange-200 hover:shadow-sm transition-all duration-150` |
| Content side (left) | `flex-1 min-w-0` |
| Item name | `text-base font-semibold text-gray-900 leading-snug` |
| Description | `text-sm text-gray-500 mt-0.5 line-clamp-2` |
| Price | `text-base font-bold text-gray-900 mt-2` |
| Image container (right) | `relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100` |
| Image | `w-full h-full object-cover` |
| Add button | `mt-3` — shadcn Button with `size="sm"` and `className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-4"` |
| Unavailable overlay | `absolute inset-0 bg-white/70 flex items-center justify-center` with `text-xs font-medium text-gray-500` |

When item has no image: replace image container with a `w-24 h-24 flex-shrink-0 rounded-lg bg-orange-50 flex items-center justify-center` div containing a `UtensilsCrossed` lucide icon in `text-orange-300 w-8 h-8`.

---

### Navbar

| Part | Tailwind classes |
|------|-----------------|
| Outer wrapper | `sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm` |
| Inner container | `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4` |
| Logo text | `text-xl font-bold text-orange-500 tracking-tight` |
| Logo icon | `w-6 h-6 text-orange-500` (lucide `UtensilsCrossed`) |
| Logo wrapper | `flex items-center gap-2 flex-shrink-0` |
| Nav right section | `flex items-center gap-3` |
| Login link | shadcn Button `variant="ghost" size="sm"` with `text-gray-600 hover:text-gray-900` |
| User menu trigger | `flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900` |
| Cart button wrapper | `relative` |
| Cart icon button | shadcn Button `variant="ghost" size="icon"` — `ShoppingCart` lucide icon `w-5 h-5` |
| Cart badge | `absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-[10px] font-bold leading-none rounded-full w-5 h-5 flex items-center justify-center` |
| SearchBar in navbar | Visible at `md:` and up; hidden on mobile (collapses into an icon or moves below) |

---

### CartDrawer

Implemented as shadcn `<Sheet side="right">`.

| Part | Tailwind classes |
|------|-----------------|
| Sheet content | `w-full sm:max-w-md flex flex-col h-full` (applied via `className` on `<SheetContent>`) |
| Header | `flex items-center justify-between px-6 py-4 border-b border-gray-100` |
| Header title | `text-lg font-semibold text-gray-900` |
| Item count sub | `text-sm text-gray-400` |
| Items scroll area | `flex-1 overflow-y-auto px-6 py-4 space-y-4` |
| Empty state | `flex-1 flex flex-col items-center justify-center gap-3 text-center px-6` |
| Empty icon | `w-16 h-16 text-gray-200` (lucide `ShoppingCart`) |
| Footer / summary | `border-t border-gray-100 px-6 py-5 space-y-4` |
| Subtotal row | `flex items-center justify-between text-base font-semibold text-gray-900` |
| Checkout CTA | shadcn Button `className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12 text-base font-semibold rounded-xl"` |

---

### CartItem (inside CartDrawer)

| Part | Tailwind classes |
|------|-----------------|
| Row wrapper | `flex items-center gap-3` |
| Item name | `flex-1 text-sm font-medium text-gray-800 leading-snug` |
| Qty stepper | `flex items-center gap-1` |
| Stepper button | shadcn Button `variant="outline" size="icon" className="w-7 h-7 rounded-full"` |
| Qty value | `w-6 text-center text-sm font-semibold text-gray-900` |
| Line total | `text-sm font-semibold text-gray-900 w-16 text-right` |
| Remove button | `text-gray-300 hover:text-red-400 transition-colors` — lucide `Trash2` icon `w-4 h-4` |

---

### OrderStatusBadge

Component wraps shadcn `<Badge variant="outline">` and applies status-specific classes.

```tsx
// Usage: <OrderStatusBadge status={order.status} />

const STATUS_CLASSES: Record<OrderStatus, string> = {
  PENDING:   'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100',
  CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100',
  PREPARING: 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100',
  READY:     'bg-green-100 text-green-800 border-green-200 hover:bg-green-100',
  DELIVERED: 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100',
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING:   'Pending',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing',
  READY:     'Ready for pickup',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
}
```

Apply `cn('text-xs font-medium px-2.5 py-0.5', STATUS_CLASSES[status])` to `<Badge>`.

---

### SearchBar

| Part | Tailwind classes |
|------|-----------------|
| Outer wrapper | `relative w-full max-w-lg` |
| Search icon | `absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none` (lucide `Search`) |
| Input | `w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition` |
| Clear button (shown when value present) | `absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600` — lucide `X` icon `w-4 h-4` |

On the HomePage, use `max-w-2xl` instead of `max-w-lg` to make it more prominent.
In the Navbar, use `max-w-xs` for a compact inline search.

---

### CategoryFilter

Horizontal scrollable pill strip shown on the Restaurant Detail page.

| Part | Tailwind classes |
|------|-----------------|
| Scroll container | `flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide` |
| Pill (inactive) | `flex-shrink-0 px-4 py-1.5 rounded-full border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:border-orange-300 hover:text-orange-500 transition-colors cursor-pointer whitespace-nowrap` |
| Pill (active) | `flex-shrink-0 px-4 py-1.5 rounded-full border border-orange-500 bg-orange-50 text-sm font-medium text-orange-600 transition-colors cursor-pointer whitespace-nowrap` |

Use `onClick` to set the active category in local state and scroll the menu to the matching section via `ref`.

To hide the scrollbar cross-browser, add this plugin to `tailwind.config.ts`:
```bash
npm install -D tailwind-scrollbar-hide
```
Then add `require('tailwind-scrollbar-hide')` to `plugins` in the config.

---

## 6. shadcn/ui Theme Config — `tailwind.config.ts`

This is the complete config that wires the brand palette into shadcn's CSS variable system.

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // shadcn CSS variable overrides mapped to brand orange
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      borderRadius: {
        lg: 'var(--radius)',         // 0.75rem (12px) — shadcn default
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: '1rem',                  // 16px — card corners
        '2xl': '1.25rem',            // 20px — prominent cards
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.07)',
        'card-hover': '0 4px 12px 0 rgb(0 0 0 / 0.1), 0 2px 4px -1px rgb(0 0 0 / 0.06)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),       // ships with shadcn — already installed
    require('tailwind-scrollbar-hide'),   // for CategoryFilter scroll strip
  ],
}

export default config
```

### CSS Variable Overrides in `src/index.css`

Replace the default shadcn vars with brand-aligned values:

```css
@layer base {
  :root {
    --background: 0 0% 98%;           /* gray-50 — page bg */
    --foreground: 0 0% 9%;            /* gray-900 — primary text */

    --card: 0 0% 100%;                /* white */
    --card-foreground: 0 0% 9%;

    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 9%;

    --primary: 25 95% 53%;            /* orange-500 */
    --primary-foreground: 0 0% 100%; /* white */

    --secondary: 0 0% 96%;            /* gray-100 */
    --secondary-foreground: 0 0% 9%;

    --muted: 0 0% 96%;
    --muted-foreground: 0 0% 45%;     /* gray-500 */

    --accent: 0 0% 96%;
    --accent-foreground: 0 0% 9%;

    --destructive: 0 84% 60%;         /* red-500 */
    --destructive-foreground: 0 0% 100%;

    --border: 0 0% 91%;               /* gray-200 */
    --input: 0 0% 91%;
    --ring: 25 95% 53%;               /* orange-500 */

    --radius: 0.75rem;                /* 12px base radius */
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground font-sans antialiased;
  }
}
```

---

## 7. Skeleton Loader Style

Use Tailwind's `animate-pulse` for all loading placeholders. Do not use third-party skeleton libraries.

### Base skeleton class (apply to all skeleton blocks)
```
bg-gray-200 rounded animate-pulse
```

### RestaurantCard Skeleton
```tsx
// In RestaurantGrid.tsx — render 8 of these while isLoading
<div className="rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm">
  {/* Image placeholder */}
  <div className="aspect-[16/9] w-full bg-gray-200 animate-pulse" />
  <div className="p-4 space-y-3">
    {/* Name */}
    <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
    {/* Meta row */}
    <div className="flex gap-3">
      <div className="h-4 w-10 bg-gray-200 rounded animate-pulse" />
      <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
    </div>
    {/* Min order */}
    <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
  </div>
</div>
```

### MenuItemCard Skeleton
```tsx
<div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100">
  <div className="flex-1 space-y-2">
    <div className="h-5 w-2/3 bg-gray-200 rounded animate-pulse" />
    <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
    <div className="h-4 w-4/5 bg-gray-200 rounded animate-pulse" />
    <div className="h-5 w-16 bg-gray-200 rounded animate-pulse mt-2" />
  </div>
  <div className="w-24 h-24 flex-shrink-0 rounded-lg bg-gray-200 animate-pulse" />
</div>
```

### Order History Row Skeleton
```tsx
<div className="p-5 bg-white rounded-xl border border-gray-100 space-y-3">
  <div className="flex justify-between">
    <div className="h-5 w-1/3 bg-gray-200 rounded animate-pulse" />
    <div className="h-5 w-20 bg-gray-200 rounded-full animate-pulse" />
  </div>
  <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
  <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse" />
</div>
```

### Text Line Skeletons (generic)
| Width | Class |
|-------|-------|
| Full | `h-4 w-full bg-gray-200 rounded animate-pulse` |
| 3/4 | `h-4 w-3/4 bg-gray-200 rounded animate-pulse` |
| 1/2 | `h-4 w-1/2 bg-gray-200 rounded animate-pulse` |
| Short (label) | `h-4 w-24 bg-gray-200 rounded animate-pulse` |

---

## 8. Responsive Breakpoints

Tailwind v3 breakpoints used in this project:

| Prefix | Min-width | Target |
|--------|-----------|--------|
| (none) | 0px | Mobile portrait (320–639px) |
| `sm:` | 640px | Mobile landscape / large phones |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Small laptops |
| `xl:` | 1280px | Desktops |

### HomePage

| Element | Mobile | sm | md | lg | xl |
|---------|--------|----|----|----|----|
| Restaurant grid cols | 1 | 2 | 2 | 3 | 4 |
| SearchBar width | `w-full` | `w-full` | `max-w-2xl mx-auto` | same | same |
| Page heading size | `text-2xl` | `text-3xl` | `text-3xl` | `text-3xl` | `text-3xl` |
| Section padding | `py-6` | `py-8` | `py-10` | `py-12` | `py-12` |

### Restaurant Detail Page

| Element | Mobile | md | lg |
|---------|--------|----|----|
| Menu grid cols | 1 | 2 | 2 |
| Category filter | Full-width scroll strip | Same | Same |
| Restaurant hero image | `aspect-[4/3]` | `aspect-[21/9]` | `aspect-[21/9]` |

### CheckoutPage

| Element | Mobile | lg |
|---------|--------|----|
| Layout | Single column stack | `grid grid-cols-3` — form `col-span-2`, summary `col-span-1` |
| Order summary | Below form | Sticky sidebar: `sticky top-24 self-start` |

### Navbar

| Element | Mobile | md |
|---------|--------|----|
| SearchBar | Hidden (icon opens mobile search overlay) | `block` inline in nav |
| Nav links | Hidden, moved to hamburger menu | Visible inline |
| Logo text | Show | Show |

### CartDrawer

| Screen | Width |
|--------|-------|
| Mobile (< sm) | `w-full` (full screen sheet) |
| sm and above | `sm:max-w-md` (fixed 448px panel from right) |

### OrderHistoryPage

| Element | Mobile | md |
|---------|--------|----|
| Order card layout | Stack: status top-right, content below | Same (list is always single column) |
| Order detail expand | Accordion-style | Same |

### Auth Page (Login/Register)

Always centered, single column:
```
min-h-screen bg-gray-50 flex items-center justify-center px-4
```
The card: `w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8`

---

## 9. Page-Level Design Notes

### HomePage
- Hero area: centered text + search bar with `py-12 text-center` wrapper on `bg-white` (contrasts with `bg-gray-50` page)
- Filter row below hero: `flex gap-2 flex-wrap justify-center mt-4` for cuisine-type quick filters
- Grid section: `mt-10`

### Restaurant Detail Page
- Sticky category filter: `sticky top-16 z-40 bg-white border-b border-gray-100 py-3` (sits just below navbar)
- Menu sections use `id={categorySlug}` for anchor scroll via `CategoryFilter` click
- "Back to restaurants" link: `flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6` with lucide `ChevronLeft`

### CheckoutPage
- Show a read-only cart summary at the top on mobile before the form
- Delivery address fieldset: `space-y-4` with shadcn `Label` + `Input` pairs
- Submit button: `w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-base rounded-xl`

### Order Confirmation Page
- Centered success state: `flex flex-col items-center text-center py-16 gap-4`
- Success icon circle: `w-20 h-20 rounded-full bg-green-100 flex items-center justify-center` — lucide `CheckCircle2` in `text-green-500 w-10 h-10`
- Order ID: `text-sm font-mono text-gray-400`
- "Track order" / "Back home" buttons: side by side on md+, stacked on mobile

### Order History Page
- Each order row: `bg-white rounded-xl border border-gray-100 p-5 hover:border-gray-200 transition-colors`
- Row layout: restaurant name (left) + badge (right) on top row, then items summary and total below
- "No orders yet" empty state: `py-20 text-center` with lucide `ClipboardList` icon in `w-16 h-16 text-gray-200`

### Login/Register Page
- shadcn `<Tabs>` with `defaultValue="login"` containing `<TabsList>` and two `<TabsContent>` panels
- Tab list: `grid w-full grid-cols-2` (makes both tabs equal width)
- Form inputs use shadcn `<Input>` with `<Label>` above each — `space-y-4` between fields
- Error messages: `text-sm text-red-500 mt-1` beneath the relevant input
- Submit button: `w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white`

### 404 Not Found Page
- `min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center px-4`
- Large "404": `text-8xl font-black text-gray-100`
- Heading below: `text-2xl font-bold text-gray-900 mt-4`
- Sub-copy: `text-gray-500 mt-2 max-w-sm`
- CTA: shadcn Button `className="mt-8 bg-orange-500 hover:bg-orange-600 text-white"` linking to `/`
- lucide `UtensilsCrossed` icon `w-16 h-16 text-orange-200 mb-6`

---

## 10. Icon Usage Reference (lucide-react)

| Context | Icon name | Size class |
|---------|-----------|-----------|
| Logo | `UtensilsCrossed` | `w-6 h-6` |
| Search | `Search` | `w-4 h-4` |
| Cart | `ShoppingCart` | `w-5 h-5` |
| Close / clear | `X` | `w-4 h-4` |
| Remove item | `Trash2` | `w-4 h-4` |
| Qty increase | `Plus` | `w-3.5 h-3.5` |
| Qty decrease | `Minus` | `w-3.5 h-3.5` |
| Rating star | `Star` | `w-4 h-4 fill-amber-400 text-amber-400` |
| Delivery time | `Clock` | `w-3.5 h-3.5` |
| Location | `MapPin` | `w-3.5 h-3.5` |
| Order success | `CheckCircle2` | `w-10 h-10` |
| Order history | `ClipboardList` | `w-16 h-16` |
| Back chevron | `ChevronLeft` | `w-4 h-4` |
| User menu | `User` | `w-4 h-4` |
| Logout | `LogOut` | `w-4 h-4` |
| 404 page | `UtensilsCrossed` | `w-16 h-16` |
| No image fallback | `UtensilsCrossed` | `w-8 h-8` |
| Phone field | `Phone` | `w-4 h-4` |
| Email field | `Mail` | `w-4 h-4` |
| Password field | `Lock` | `w-4 h-4` |
| Preparing status | `ChefHat` | `w-4 h-4` |

All icons should use `aria-hidden="true"` when decorative. Add `aria-label` when an icon is the only content of a button.

---

## 11. Accessibility Checklist

Apply these conventions to every component before considering it done.

| Rule | Implementation |
|------|---------------|
| Minimum touch target | `min-w-[44px] min-h-[44px]` on all clickable elements |
| Focus rings | `focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2` — use `focus-visible:` not `focus:` |
| Color contrast | All text on white: gray-900 (16:1), gray-600 (5.7:1), gray-400 on white fails — do not use for meaningful text |
| Icon buttons | Always include `aria-label` e.g. `aria-label="Remove item"` |
| Form inputs | Every `<Input>` has a `<Label>` with matching `htmlFor` / `id` pair |
| Loading states | Skeleton containers include `aria-label="Loading..."` or `role="status"` |
| Modal focus trap | shadcn Dialog handles this automatically — do not disable |
| Reduced motion | `motion-reduce:transition-none motion-reduce:animate-none` on animated elements |
| Disabled buttons | Use the HTML `disabled` attribute — do not simulate with CSS opacity alone |

---

## Quick Reference Cheat Sheet

```
Brand orange:    bg-orange-500 / text-orange-500 / border-orange-500
Page bg:         bg-gray-50
Card bg:         bg-white border border-gray-100 shadow-sm
Primary text:    text-gray-900
Secondary text:  text-gray-600
Muted text:      text-gray-400
Container:       max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
Card corners:    rounded-2xl (restaurant cards) / rounded-xl (menu items)
Button primary:  bg-orange-500 hover:bg-orange-600 text-white
Input:           border-gray-200 focus:ring-orange-500
Skeleton:        bg-gray-200 rounded animate-pulse
Transition:      transition-all duration-200
```
