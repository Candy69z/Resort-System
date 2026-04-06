-- ================================================================
-- Resort PMS & POS — Initial Database Schema
-- ================================================================
-- Run this entire file in the Supabase SQL Editor:
--   Dashboard → SQL Editor → New Query → Paste → Run
--
-- Sections:
--   1. TABLES       (rooms, menu_main_categories, menu_sub_categories,
--                    menu_items, orders, order_items)
--   2. INDEXES      (common query paths)
--   3. ROW LEVEL SECURITY  (disabled for development; enable in prod)
--   4. SEED DATA    (matches mock-data.ts exactly — safe to re-run)
-- ================================================================


-- ────────────────────────────────────────────────────────────────
-- 1. TABLES
-- ────────────────────────────────────────────────────────────────

-- ── Rooms ────────────────────────────────────────────────────────
-- Combines the Room definition AND its daily housekeeping status.
-- Housekeeping columns (hk_*) are updated by the /housekeeping page.

CREATE TABLE IF NOT EXISTS rooms (
  id                  TEXT        PRIMARY KEY,
  name_en             TEXT        NOT NULL,
  name_th             TEXT        NOT NULL,
  type                TEXT        NOT NULL
    CHECK (type IN ('tree_house', 'rice_field', 'tent_house', 'camping')),
  sub_type            TEXT
    CHECK (sub_type IN ('field_view', 'river_view')),
  price_per_night     NUMERIC(10, 2) NOT NULL DEFAULT 0,
  status              TEXT        NOT NULL DEFAULT 'available'
    CHECK (status IN ('available', 'occupied', 'reserved', 'cleaning')),
  amenities           TEXT[]      NOT NULL DEFAULT '{}',
  description         TEXT,
  max_guests          INT         NOT NULL DEFAULT 2,

  -- Housekeeping operational columns
  housekeeping_status TEXT        NOT NULL DEFAULT 'ready'
    CHECK (housekeeping_status IN ('dirty', 'cleaning', 'inspected', 'ready')),
  hk_last_updated     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  hk_assigned_to      TEXT,
  hk_notes            TEXT,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Menu Main Categories ─────────────────────────────────────────
-- Dynamic: staff can add/rename/delete categories via /admin.

CREATE TABLE IF NOT EXISTS menu_main_categories (
  id          TEXT        PRIMARY KEY,
  name_en     TEXT        NOT NULL,
  name_th     TEXT        NOT NULL,
  color       TEXT        NOT NULL DEFAULT 'bg-sage-100 text-sage-700 border-sage-200',
  sort_order  INT         NOT NULL DEFAULT 99,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Menu Sub-Categories ──────────────────────────────────────────
-- Each sub-category belongs to exactly one main category.
-- Deleting a main category cascades and removes its sub-categories.

CREATE TABLE IF NOT EXISTS menu_sub_categories (
  id                  TEXT        PRIMARY KEY,
  name_en             TEXT        NOT NULL,
  name_th             TEXT        NOT NULL,
  parent_category_id  TEXT        NOT NULL
    REFERENCES menu_main_categories (id) ON DELETE CASCADE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Menu Items ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS menu_items (
  id                  TEXT        PRIMARY KEY,
  name_en             TEXT        NOT NULL,
  name_th             TEXT        NOT NULL,
  category_id         TEXT        NOT NULL
    REFERENCES menu_main_categories (id) ON DELETE RESTRICT,
  sub_category_id     TEXT
    REFERENCES menu_sub_categories (id) ON DELETE SET NULL,
  price               NUMERIC(10, 2) NOT NULL DEFAULT 0,
  available           BOOLEAN     NOT NULL DEFAULT TRUE,
  description         TEXT,
  -- Time-of-day availability window (e.g. cocktails from 17:00)
  available_from      TIME,
  available_to        TIME,
  -- Link to inventory for auto-deduction on POS orders
  inventory_item_id   TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Orders ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS orders (
  id                  TEXT        PRIMARY KEY,
  room_id             TEXT        REFERENCES rooms (id) ON DELETE SET NULL,
  room_name           TEXT,                           -- snapshot at order time
  status              TEXT        NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'closed', 'paid')),
  total               NUMERIC(10, 2) NOT NULL DEFAULT 0,
  payment_method      TEXT
    CHECK (payment_method IN ('cash', 'credit_card', 'promptpay')),
  payment_ref         TEXT,
  payment_slip_url    TEXT,
  paid_at             TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at           TIMESTAMPTZ
);

-- ── Order Items ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS order_items (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        TEXT        NOT NULL
    REFERENCES orders (id) ON DELETE CASCADE,
  menu_item_id    TEXT        NOT NULL,               -- NOT a FK (items may be deleted)
  name            TEXT        NOT NULL,               -- name snapshot at order time
  price           NUMERIC(10, 2) NOT NULL,
  quantity        INT         NOT NULL DEFAULT 1 CHECK (quantity > 0),
  note            TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ────────────────────────────────────────────────────────────────
-- 2. INDEXES
-- ────────────────────────────────────────────────────────────────

-- Housekeeping page: filter by status
CREATE INDEX IF NOT EXISTS idx_rooms_hk_status
  ON rooms (housekeeping_status);

-- POS: filter available menu items by category
CREATE INDEX IF NOT EXISTS idx_menu_items_category
  ON menu_items (category_id, available);

-- Sub-categories: filter by parent
CREATE INDEX IF NOT EXISTS idx_sub_cats_parent
  ON menu_sub_categories (parent_category_id);

-- Orders: filter by room and status (open-bill lookup)
CREATE INDEX IF NOT EXISTS idx_orders_room_status
  ON orders (room_id, status);

-- Order items: join by order
CREATE INDEX IF NOT EXISTS idx_order_items_order
  ON order_items (order_id);


-- ────────────────────────────────────────────────────────────────
-- 3. ROW LEVEL SECURITY
-- ────────────────────────────────────────────────────────────────
-- RLS is DISABLED by default for easier local development.
-- Enable and tune policies before going to production.

ALTER TABLE rooms                DISABLE ROW LEVEL SECURITY;
ALTER TABLE menu_main_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE menu_sub_categories  DISABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items           DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders               DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items          DISABLE ROW LEVEL SECURITY;

-- ── Production RLS template (uncomment & adjust when ready) ─────
-- ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Staff can read rooms"
--   ON rooms FOR SELECT USING (auth.role() = 'authenticated');
-- CREATE POLICY "Admin can modify rooms"
--   ON rooms FOR ALL USING (auth.jwt() ->> 'role' = 'admin');


-- ────────────────────────────────────────────────────────────────
-- 4. SEED DATA
-- ────────────────────────────────────────────────────────────────
-- These INSERT statements mirror mock-data.ts exactly.
-- All statements use ON CONFLICT DO NOTHING so re-running is safe.


-- ── 4.1  Menu Main Categories ────────────────────────────────────

INSERT INTO menu_main_categories (id, name_en, name_th, color, sort_order)
VALUES
  ('coffee',   'Coffee',   'กาแฟ',    'bg-wood-100 text-wood-700 border-wood-200',      1),
  ('tea',      'Tea',      'ชา',      'bg-sage-100 text-sage-700 border-sage-200',      2),
  ('cocktail', 'Cocktail', 'ค็อกเทล', 'bg-purple-50 text-purple-700 border-purple-200', 3),
  ('food',     'Food',     'อาหาร',   'bg-amber-50 text-amber-700 border-amber-200',    4),
  ('special',  'Special',  'พิเศษ',   'bg-red-50 text-red-700 border-red-200',          5)
ON CONFLICT (id) DO NOTHING;


-- ── 4.2  Menu Sub-Categories ─────────────────────────────────────

INSERT INTO menu_sub_categories (id, name_en, name_th, parent_category_id)
VALUES
  ('SC-01', 'Hot Coffee',   'กาแฟร้อน',        'coffee'),
  ('SC-02', 'Iced Coffee',  'กาแฟเย็น',        'coffee'),
  ('SC-03', 'Herbal Tea',   'ชาสมุนไพร',       'tea'),
  ('SC-04', 'Milk Tea',     'ชานม',            'tea'),
  ('SC-05', 'Mocktail',     'น้ำผสม',          'cocktail'),
  ('SC-06', 'Classic',      'คลาสสิก',         'cocktail'),
  ('SC-07', 'Signature',    'ซิกเนเจอร์',      'cocktail'),
  ('SC-08', 'Main Course',  'อาหารจานหลัก',    'food'),
  ('SC-09', 'Snack',        'ของทานเล่น',      'food'),
  ('SC-10', 'Sides',        'เครื่องเคียง',    'food'),
  ('SC-11', 'BBQ Set',      'เซตบาร์บีคิว',    'special'),
  ('SC-12', 'Hot Pot Set',  'เซตสุกี้',        'special')
ON CONFLICT (id) DO NOTHING;


-- ── 4.3  Rooms (18 rooms — definition + HK status) ──────────────

INSERT INTO rooms (id, name_en, name_th, type, sub_type, price_per_night, status, amenities, description, max_guests, housekeeping_status, hk_last_updated, hk_assigned_to)
VALUES
  -- Tree Houses
  ('TH-01', 'Tree House 1', 'บ้านต้นไม้ 1', 'tree_house', NULL, 788, 'occupied',  ARRAY['Fan','Water Heater','Balcony'], 'Nature view, private balcony', 2, 'dirty',     '2026-04-03T10:00:00Z', 'Noi'),
  ('TH-02', 'Tree House 2', 'บ้านต้นไม้ 2', 'tree_house', NULL, 788, 'available', ARRAY['Fan','Water Heater','Balcony'], 'Nature view, private balcony', 2, 'ready',     '2026-04-03T09:30:00Z', 'Noi'),
  ('TH-03', 'Tree House 3', 'บ้านต้นไม้ 3', 'tree_house', NULL, 788, 'reserved',  ARRAY['Fan','Water Heater','Balcony'], 'Nature view, private balcony', 2, 'cleaning',  '2026-04-03T10:15:00Z', 'Malee'),

  -- Rice Fields
  ('RF-01', 'Rice Field 1', 'บ้านริมนา 1', 'rice_field', NULL, 588, 'occupied',  ARRAY['Fan','Water Heater'], 'Rice field & river view', 2, 'dirty',     '2026-04-03T09:00:00Z', NULL),
  ('RF-02', 'Rice Field 2', 'บ้านริมนา 2', 'rice_field', NULL, 588, 'occupied',  ARRAY['Fan','Water Heater'], 'Rice field & river view', 2, 'inspected', '2026-04-03T09:45:00Z', 'Malee'),
  ('RF-03', 'Rice Field 3', 'บ้านริมนา 3', 'rice_field', NULL, 588, 'cleaning',  ARRAY['Fan','Water Heater'], 'Rice field & river view', 2, 'ready',     '2026-04-03T08:00:00Z', NULL),

  -- Tent Houses
  ('TE-01', 'Tent House 1', 'บ้านเต้นท์ 1', 'tent_house', NULL, 888, 'occupied',  ARRAY['Fan','Water Heater'], 'Permanent glamping tent', 2, 'cleaning', '2026-04-03T10:30:00Z', 'Noi'),
  ('TE-02', 'Tent House 2', 'บ้านเต้นท์ 2', 'tent_house', NULL, 888, 'available', ARRAY['Fan','Water Heater'], 'Permanent glamping tent', 2, 'ready',    '2026-04-03T08:30:00Z', NULL),

  -- Camp Field
  ('CF-01', 'Camp Field 1', 'ลานกางเต็นท์ 1', 'camping', 'field_view', 200, 'occupied',  ARRAY[]::TEXT[], 'Field view camping spot', 2, 'dirty',     '2026-04-03T09:00:00Z', NULL),
  ('CF-02', 'Camp Field 2', 'ลานกางเต็นท์ 2', 'camping', 'field_view', 200, 'available', ARRAY[]::TEXT[], 'Field view camping spot', 2, 'ready',     '2026-04-03T07:30:00Z', NULL),
  ('CF-03', 'Camp Field 3', 'ลานกางเต็นท์ 3', 'camping', 'field_view', 200, 'available', ARRAY[]::TEXT[], 'Field view camping spot', 2, 'ready',     '2026-04-03T07:30:00Z', NULL),
  ('CF-04', 'Camp Field 4', 'ลานกางเต็นท์ 4', 'camping', 'field_view', 200, 'available', ARRAY[]::TEXT[], 'Field view camping spot', 2, 'inspected', '2026-04-03T09:50:00Z', 'Malee'),
  ('CF-05', 'Camp Field 5', 'ลานกางเต็นท์ 5', 'camping', 'field_view', 200, 'reserved',  ARRAY[]::TEXT[], 'Field view camping spot', 2, 'dirty',     '2026-04-03T09:00:00Z', NULL),

  -- Camp River
  ('CR-01', 'Camp River 1', 'ลานริมน้ำ 1', 'camping', 'river_view', 200, 'occupied',  ARRAY[]::TEXT[], 'River view camping spot', 2, 'cleaning', '2026-04-03T10:20:00Z', 'Noi'),
  ('CR-02', 'Camp River 2', 'ลานริมน้ำ 2', 'camping', 'river_view', 200, 'available', ARRAY[]::TEXT[], 'River view camping spot', 2, 'ready',    '2026-04-03T08:00:00Z', NULL),
  ('CR-03', 'Camp River 3', 'ลานริมน้ำ 3', 'camping', 'river_view', 200, 'available', ARRAY[]::TEXT[], 'River view camping spot', 2, 'ready',    '2026-04-03T08:00:00Z', NULL),
  ('CR-04', 'Camp River 4', 'ลานริมน้ำ 4', 'camping', 'river_view', 200, 'available', ARRAY[]::TEXT[], 'River view camping spot', 2, 'ready',    '2026-04-03T08:00:00Z', NULL),
  ('CR-05', 'Camp River 5', 'ลานริมน้ำ 5', 'camping', 'river_view', 200, 'available', ARRAY[]::TEXT[], 'River view camping spot', 2, 'ready',    '2026-04-03T08:00:00Z', NULL)
ON CONFLICT (id) DO NOTHING;


-- ── 4.4  Menu Items (25 items) ───────────────────────────────────

INSERT INTO menu_items (id, name_en, name_th, category_id, sub_category_id, price, available, description, available_from, available_to, inventory_item_id)
VALUES
  -- Coffee — Hot
  ('M-01', 'Espresso',            'เอสเปรสโซ่',          'coffee',   'SC-01', 60,  TRUE,  NULL,                              NULL,    NULL,    NULL),
  ('M-02', 'Americano',           'อเมริกาโน่',           'coffee',   'SC-01', 65,  TRUE,  NULL,                              NULL,    NULL,    NULL),
  ('M-03', 'Café Latte',          'กาแฟลาเต้',            'coffee',   'SC-01', 75,  TRUE,  NULL,                              NULL,    NULL,    NULL),
  ('M-04', 'Cappuccino',          'คาปูชิโน่',            'coffee',   'SC-01', 75,  TRUE,  NULL,                              NULL,    NULL,    NULL),
  -- Coffee — Iced
  ('M-05', 'Iced Mocha',          'ไอซ์โมค่า',            'coffee',   'SC-02', 85,  TRUE,  NULL,                              NULL,    NULL,    NULL),
  -- Tea
  ('M-06', 'Thai Milk Tea',       'ชานมไทย',             'tea',      'SC-04', 55,  TRUE,  NULL,                              NULL,    NULL,    NULL),
  ('M-07', 'Jasmine Green Tea',   'ชาเขียวมะลิ',          'tea',      'SC-03', 50,  TRUE,  NULL,                              NULL,    NULL,    NULL),
  ('M-08', 'Butterfly Pea Latte', 'ลาเต้ดอกอัญชัน',       'tea',      'SC-04', 70,  TRUE,  NULL,                              NULL,    NULL,    NULL),
  -- Cocktails
  ('M-09', 'Mojito',              'โมฮิโต้',              'cocktail', 'SC-06', 220, TRUE,  NULL,                              '17:00', '22:00', 'INV-06'),
  ('M-10', 'Margarita',           'มาร์การิต้า',           'cocktail', 'SC-06', 240, TRUE,  NULL,                              '17:00', '22:00', 'INV-07'),
  ('M-11', 'Negroni',             'เนโกรนี',              'cocktail', 'SC-06', 250, TRUE,  NULL,                              '17:00', '22:00', 'INV-08'),
  ('M-12', 'Old Fashioned',       'โอลด์แฟชั่น',           'cocktail', 'SC-06', 260, TRUE,  NULL,                              '17:00', '22:00', 'INV-09'),
  ('M-13', 'Jungle Sunset',       'จังเกิ้ลซันเซ็ต',      'cocktail', 'SC-07', 280, TRUE,  'Signature',                       '17:00', '22:00', 'INV-06'),
  -- Food
  ('M-14', 'Khao Soi Gai',        'ข้าวซอยไก่',           'food',     'SC-08', 120, TRUE,  'Northern curry noodle soup',      NULL,    NULL,    NULL),
  ('M-15', 'Pad Thai',            'ผัดไทย',               'food',     'SC-08', 100, TRUE,  NULL,                              NULL,    NULL,    NULL),
  ('M-16', 'Som Tam',             'ส้มตำ',                'food',     'SC-09', 80,  TRUE,  'Papaya salad',                    NULL,    NULL,    NULL),
  ('M-17', 'Nam Prik Ong',        'น้ำพริกอ่อง',          'food',     'SC-09', 90,  TRUE,  'Northern chili dip set',          NULL,    NULL,    NULL),
  ('M-18', 'Gaeng Hang Lay',      'แกงฮังเล',             'food',     'SC-08', 130, TRUE,  'Northern pork curry',             NULL,    NULL,    NULL),
  ('M-19', 'Lab Moo',             'ลาบหมู',               'food',     'SC-09', 95,  TRUE,  'Spicy minced pork salad',         NULL,    NULL,    NULL),
  ('M-20', 'Jungle Curry',        'แกงป่า',               'food',     'SC-08', 140, TRUE,  'Spicy herbal curry',              NULL,    NULL,    NULL),
  ('M-21', 'Grilled River Fish',  'ปลาย่าง',              'food',     'SC-08', 180, TRUE,  NULL,                              NULL,    NULL,    NULL),
  ('M-22', 'Sticky Rice',         'ข้าวเหนียว',           'food',     'SC-10', 20,  TRUE,  NULL,                              NULL,    NULL,    NULL),
  ('M-23', 'Steamed Rice',        'ข้าวสวย',              'food',     'SC-10', 20,  TRUE,  NULL,                              NULL,    NULL,    NULL),
  -- Special
  ('M-24', 'Moo Kratha Set (2 pax)', 'เซตหมูกระทะ (2 ท่าน)', 'special', 'SC-11', 350, TRUE, 'Thai BBQ grill set',           '17:00', '21:00', 'INV-01'),
  ('M-25', 'Moo Jum Set (2 pax)',   'เซตหมูจุ่ม (2 ท่าน)',   'special', 'SC-12', 300, TRUE, 'Thai hot pot set',             '17:00', '21:00', 'INV-02')
ON CONFLICT (id) DO NOTHING;


-- ────────────────────────────────────────────────────────────────
-- Done! Verify with:
--   SELECT COUNT(*) FROM rooms;                -- expect 18
--   SELECT COUNT(*) FROM menu_main_categories; -- expect  5
--   SELECT COUNT(*) FROM menu_sub_categories;  -- expect 12
--   SELECT COUNT(*) FROM menu_items;           -- expect 25
-- ────────────────────────────────────────────────────────────────
