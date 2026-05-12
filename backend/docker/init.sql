-- Schema and seed data for the online restaurant platform
-- Executed automatically on first container start

CREATE TYPE "OrderStatus" AS ENUM (
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'DELIVERED',
  'CANCELLED'
);

CREATE TABLE "Restaurant" (
  id          TEXT        PRIMARY KEY,
  name        TEXT        NOT NULL,
  description TEXT,
  "imageUrl"  TEXT,
  address     TEXT        NOT NULL,
  phone       TEXT,
  "isOpen"    BOOLEAN     NOT NULL DEFAULT true,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX "Restaurant_isOpen_idx" ON "Restaurant"("isOpen");

CREATE TABLE "MenuItem" (
  id             TEXT           PRIMARY KEY,
  "restaurantId" TEXT           NOT NULL REFERENCES "Restaurant"(id),
  name           TEXT           NOT NULL,
  description    TEXT,
  price          DECIMAL(10, 2) NOT NULL,
  "imageUrl"     TEXT,
  "isAvailable"  BOOLEAN        NOT NULL DEFAULT true,
  category       TEXT,
  "createdAt"    TIMESTAMPTZ    NOT NULL DEFAULT now(),
  "updatedAt"    TIMESTAMPTZ    NOT NULL DEFAULT now()
);

CREATE INDEX "MenuItem_restaurantId_idx"              ON "MenuItem"("restaurantId");
CREATE INDEX "MenuItem_restaurantId_isAvailable_idx"  ON "MenuItem"("restaurantId", "isAvailable");

CREATE TABLE "Order" (
  id             TEXT           PRIMARY KEY,
  "restaurantId" TEXT           NOT NULL REFERENCES "Restaurant"(id),
  status         "OrderStatus"  NOT NULL DEFAULT 'PENDING',
  "totalPrice"   DECIMAL(10, 2) NOT NULL,
  note           TEXT,
  "createdAt"    TIMESTAMPTZ    NOT NULL DEFAULT now(),
  "updatedAt"    TIMESTAMPTZ    NOT NULL DEFAULT now()
);

CREATE INDEX "Order_restaurantId_idx" ON "Order"("restaurantId");
CREATE INDEX "Order_status_idx"       ON "Order"(status);

CREATE TABLE "OrderItem" (
  id           TEXT           PRIMARY KEY,
  "orderId"    TEXT           NOT NULL REFERENCES "Order"(id) ON DELETE CASCADE,
  "menuItemId" TEXT           NOT NULL REFERENCES "MenuItem"(id),
  quantity     INT            NOT NULL,
  "unitPrice"  DECIMAL(10, 2) NOT NULL
);

CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- ─── Seed Data ────────────────────────────────────────────────────────────────

INSERT INTO "Restaurant" (id, name, description, address, phone, "isOpen") VALUES
  ('rest_001', 'Burger House',       'Classic American burgers and fries',   '12 Main St, Almaty',   '+7 727 100 0001', true),
  ('rest_002', 'Sushi Garden',       'Fresh sushi and Japanese cuisine',     '45 Park Ave, Almaty',  '+7 727 100 0002', true),
  ('rest_003', 'Pizza Palace',       'Wood-fired Neapolitan pizzas',         '8 Lenin St, Almaty',   '+7 727 100 0003', true),
  ('rest_004', 'Lagman House',       'Authentic Uyghur and Central Asian',   '3 Alatau Rd, Almaty',  '+7 727 100 0004', true),
  ('rest_005', 'Green Bowl',         'Healthy salads, bowls and smoothies',  '22 Abay Ave, Almaty',  '+7 727 100 0005', false);

-- Burger House menu
INSERT INTO "MenuItem" (id, "restaurantId", name, description, price, category, "isAvailable") VALUES
  ('item_001', 'rest_001', 'Classic Burger',    'Beef patty, lettuce, tomato, cheddar',  1800.00, 'Burgers',  true),
  ('item_002', 'rest_001', 'Double Smash',      'Two smashed patties, secret sauce',     2400.00, 'Burgers',  true),
  ('item_003', 'rest_001', 'Crispy Chicken',    'Fried chicken fillet, coleslaw',        1900.00, 'Burgers',  true),
  ('item_004', 'rest_001', 'Cheese Fries',      'Crinkle fries with cheddar sauce',       800.00, 'Sides',    true),
  ('item_005', 'rest_001', 'Milkshake',         'Vanilla, chocolate or strawberry',       900.00, 'Drinks',   true);

-- Sushi Garden menu
INSERT INTO "MenuItem" (id, "restaurantId", name, description, price, category, "isAvailable") VALUES
  ('item_006', 'rest_002', 'Salmon Nigiri (2)',  'Fresh Atlantic salmon over rice',       1200.00, 'Nigiri',   true),
  ('item_007', 'rest_002', 'California Roll',    '8 pcs — crab, avocado, cucumber',      1500.00, 'Rolls',    true),
  ('item_008', 'rest_002', 'Spicy Tuna Roll',    '8 pcs — tuna, sriracha mayo',          1700.00, 'Rolls',    true),
  ('item_009', 'rest_002', 'Edamame',            'Salted steamed soybeans',               700.00, 'Starters', true),
  ('item_010', 'rest_002', 'Miso Soup',          'Tofu, wakame, green onion',             500.00, 'Soups',    true);

-- Pizza Palace menu
INSERT INTO "MenuItem" (id, "restaurantId", name, description, price, category, "isAvailable") VALUES
  ('item_011', 'rest_003', 'Margherita',        'Tomato, mozzarella, basil',            2200.00, 'Pizza',    true),
  ('item_012', 'rest_003', 'Pepperoni',         'Double pepperoni, tomato, mozzarella', 2600.00, 'Pizza',    true),
  ('item_013', 'rest_003', 'Quattro Formaggi',  'Four-cheese blend',                    2800.00, 'Pizza',    true),
  ('item_014', 'rest_003', 'Tiramisu',          'Classic Italian dessert',              1100.00, 'Desserts', true),
  ('item_015', 'rest_003', 'Sparkling Water',   '500 ml bottle',                         400.00, 'Drinks',   true);

-- Lagman House menu
INSERT INTO "MenuItem" (id, "restaurantId", name, description, price, category, "isAvailable") VALUES
  ('item_016', 'rest_004', 'Lagman',            'Hand-pulled noodles, lamb, vegetables', 1800.00, 'Main',     true),
  ('item_017', 'rest_004', 'Samsa (3 pcs)',     'Baked lamb pastry',                    1200.00, 'Starters', true),
  ('item_018', 'rest_004', 'Plov',              'Rice, lamb, carrots, spices',          2000.00, 'Main',     true),
  ('item_019', 'rest_004', 'Chuchvara soup',    'Lamb dumpling soup',                   1400.00, 'Soups',    true),
  ('item_020', 'rest_004', 'Green Tea',         'Traditional pot — serves 2',            600.00, 'Drinks',   true);

-- Green Bowl menu (restaurant is closed, items still seeded for testing)
INSERT INTO "MenuItem" (id, "restaurantId", name, description, price, category, "isAvailable") VALUES
  ('item_021', 'rest_005', 'Buddha Bowl',       'Quinoa, roasted veggies, tahini',      2100.00, 'Bowls',    true),
  ('item_022', 'rest_005', 'Green Smoothie',    'Spinach, banana, almond milk',          900.00, 'Drinks',   true);
