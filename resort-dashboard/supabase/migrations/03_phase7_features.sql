-- ============================================================
-- Migration 03 — Phase 7: Production Features
-- Resort PMS & POS — Lampang Resort
-- ============================================================
-- Run this script ONCE in the Supabase SQL Editor.
-- All statements use IF NOT EXISTS / IF EXISTS guards
-- so re-running is safe.
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. EXTEND EXISTING TABLES
-- ─────────────────────────────────────────────────────────────

-- 1a. Add image_url to menu_items (for F&B POS thumbnails)
ALTER TABLE menu_items
  ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT NULL;

COMMENT ON COLUMN menu_items.image_url IS
  'Supabase Storage public URL for the menu item photo thumbnail';

-- 1b. Ensure bookings table has all required columns
--     (created in migration 02; adding any missing columns defensively)
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS guest_id         TEXT,
  ADD COLUMN IF NOT EXISTS paid_at          TIMESTAMPTZ;

-- ─────────────────────────────────────────────────────────────
-- 2. INVENTORY ITEMS TABLE
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS inventory_items (
  id              TEXT        PRIMARY KEY,
  name            TEXT        NOT NULL,
  category        TEXT        NOT NULL DEFAULT 'consumable'
                  CHECK (category IN (
                    'food_supply', 'beverage', 'equipment',
                    'consumable', 'cleaning_supplies', 'amenities'
                  )),
  unit            TEXT        NOT NULL DEFAULT 'unit',
  current_stock   NUMERIC     NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
  min_threshold   NUMERIC     NOT NULL DEFAULT 5  CHECK (min_threshold >= 0),
  cost_per_unit   NUMERIC     NOT NULL DEFAULT 0  CHECK (cost_per_unit >= 0),
  last_restocked  DATE,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE inventory_items DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_inv_category   ON inventory_items (category);
CREATE INDEX IF NOT EXISTS idx_inv_low_stock  ON inventory_items (current_stock, min_threshold);

COMMENT ON TABLE inventory_items IS
  'Central inventory catalogue for F&B ingredients, amenities, supplies, and equipment';

-- ─────────────────────────────────────────────────────────────
-- 3. USER PROFILES / STAFF ACCOUNTS TABLE
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_profiles (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id     UUID        UNIQUE,          -- nullable: links to auth.users when using Supabase Auth
  username         TEXT        NOT NULL UNIQUE,
  name             TEXT        NOT NULL,
  name_th          TEXT,
  role             TEXT        NOT NULL DEFAULT 'staff'
                   CHECK (role IN ('admin', 'manager', 'staff')),
  department       TEXT        NOT NULL DEFAULT 'general'
                   CHECK (department IN (
                     'frontdesk', 'housekeeping', 'fnb',
                     'activities', 'admin', 'general'
                   )),
  avatar_initials  TEXT        NOT NULL DEFAULT 'ST',
  is_active        BOOLEAN     NOT NULL DEFAULT true,
  phone            TEXT,
  notes            TEXT,
  -- DEV ONLY: plaintext password for mock-auth compatibility.
  -- In production, remove this column and use Supabase Auth exclusively.
  password_plain   TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_staff_role       ON user_profiles (role);
CREATE INDEX IF NOT EXISTS idx_staff_department ON user_profiles (department);
CREATE INDEX IF NOT EXISTS idx_staff_active     ON user_profiles (is_active);

COMMENT ON TABLE user_profiles IS
  'Staff accounts and roles. password_plain is dev-only — use Supabase Auth in production.';

-- ─────────────────────────────────────────────────────────────
-- 4. SHARED UTILITY: updated_at AUTO-TRIGGER FUNCTION
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach to inventory_items
DROP TRIGGER IF EXISTS trg_inventory_items_updated_at ON inventory_items;
CREATE TRIGGER trg_inventory_items_updated_at
  BEFORE UPDATE ON inventory_items
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Attach to user_profiles
DROP TRIGGER IF EXISTS trg_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER trg_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- 5. AUTOMATED ROOM STATUS SYNCHRONIZATION TRIGGER
--    Rules:
--      confirmed  → no room change (just a reservation)
--      checked_in → rooms.status = 'occupied'
--      checked_out→ rooms.status = 'cleaning'
--                   rooms.housekeeping_status = 'dirty'
--      cancelled  → if was checked_in, rooms.status = 'available'
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION sync_room_from_booking_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Guest checks IN → mark room occupied
  IF NEW.status = 'checked_in' AND OLD.status <> 'checked_in' THEN
    UPDATE rooms
    SET status = 'occupied'
    WHERE id = NEW.room_id;
  END IF;

  -- Guest checks OUT → send room to housekeeping
  IF NEW.status = 'checked_out' AND OLD.status <> 'checked_out' THEN
    UPDATE rooms
    SET
      status              = 'cleaning',
      housekeeping_status = 'dirty',
      hk_last_updated     = NOW()
    WHERE id = NEW.room_id;
  END IF;

  -- Booking cancelled while guest was inside → free up room
  IF NEW.status = 'cancelled' AND OLD.status = 'checked_in' THEN
    UPDATE rooms
    SET
      status              = 'available',
      housekeeping_status = 'dirty',
      hk_last_updated     = NOW()
    WHERE id = NEW.room_id;
  END IF;

  -- New confirmed booking → mark room reserved
  IF NEW.status = 'confirmed' AND OLD.status = 'cancelled' THEN
    UPDATE rooms
    SET status = 'reserved'
    WHERE id = NEW.room_id AND status = 'available';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_booking_status_sync ON bookings;
CREATE TRIGGER trg_booking_status_sync
  AFTER UPDATE OF status ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION sync_room_from_booking_status();

COMMENT ON FUNCTION sync_room_from_booking_status IS
  'Automatically syncs rooms.status and rooms.housekeeping_status when a booking status changes.';

-- ─────────────────────────────────────────────────────────────
-- 6. RLS POLICY STUBS (currently disabled for development)
--    Uncomment and adapt these when deploying to production
--    with Supabase Auth enabled.
-- ─────────────────────────────────────────────────────────────

/*
-- Enable RLS
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles   ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all inventory
CREATE POLICY "inventory_read_auth"  ON inventory_items
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only admins can modify inventory
CREATE POLICY "inventory_write_admin" ON inventory_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.auth_user_id = auth.uid() AND up.role = 'admin'
    )
  );

-- Staff can only read their own profile
CREATE POLICY "staff_read_own" ON user_profiles
  FOR SELECT USING (auth_user_id = auth.uid());

-- Only admins can manage all profiles
CREATE POLICY "staff_admin_all" ON user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.auth_user_id = auth.uid() AND up.role IN ('admin', 'manager')
    )
  );
*/

-- ─────────────────────────────────────────────────────────────
-- 7. SEED DATA
-- ─────────────────────────────────────────────────────────────

-- 7a. Inventory Items (mirrors mock-data.ts exactly; ON CONFLICT is safe to re-run)
INSERT INTO inventory_items
  (id, name, category, unit, current_stock, min_threshold, cost_per_unit, last_restocked)
VALUES
  ('INV-001', 'Coffee Beans (Arabica)',      'food_supply',       'kg',    3,  5,  450, '2026-04-01'),
  ('INV-002', 'Milk (Fresh)',                'beverage',          'ltr',  12, 10,   65, '2026-04-02'),
  ('INV-003', 'Sugar (White)',               'food_supply',       'kg',   20,  5,   28, '2026-03-28'),
  ('INV-004', 'Drinking Water (1.5L)',       'beverage',          'btl',  48, 24,   12, '2026-04-01'),
  ('INV-005', 'Jasmine Rice (Hom Mali)',     'food_supply',       'kg',   25, 10,   55, '2026-03-30'),
  ('INV-006', 'Disposable Cups',            'consumable',        'pcs',  80, 50,    2, '2026-03-25'),
  ('INV-007', 'Straws (Paper)',             'consumable',        'pcs', 150, 50,    1, '2026-03-25'),
  ('INV-008', 'Cleaning Alcohol 70%',       'cleaning_supplies', 'btl',   2,  5,  120, '2026-03-20'),
  ('INV-009', 'Broom & Dustpan Set',        'equipment',         'set',   4,  2,  350, '2026-02-15'),
  ('INV-010', 'Toilet Paper (Roll)',        'amenities',         'roll',  30, 20,    8, '2026-04-01'),
  ('INV-011', 'Shampoo (50ml sachet)',      'amenities',         'pcs',  40, 20,   15, '2026-03-28'),
  ('INV-012', 'Soap Bar (Hotel)',           'amenities',         'pcs',  35, 20,   12, '2026-03-28'),
  ('INV-013', 'Ice (Crushed)',              'beverage',          'kg',   10,  5,   20, '2026-04-03'),
  ('INV-014', 'Lychee Juice (1L)',          'beverage',          'btl',   6, 10,   95, '2026-03-29'),
  ('INV-015', 'Instant Noodles',           'food_supply',       'pkt',  24, 12,   15, '2026-03-27'),
  ('INV-016', 'Moo Kratha Pork (frozen)',   'food_supply',       'kg',    8,  5,  160, '2026-04-02'),
  ('INV-017', 'Floor Cleaner',             'cleaning_supplies', 'btl',   3,  5,   85, '2026-03-15'),
  ('INV-018', 'Zip Lock Bags (pack)',       'consumable',        'pack',  5,  3,   45, '2026-03-20')
ON CONFLICT (id) DO NOTHING;

-- 7b. Staff Profiles (seed matches mock mockUsers in mock-data.ts)
INSERT INTO user_profiles
  (id, username, name, role, department, avatar_initials, is_active, password_plain)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin',    'Admin User',      'admin',   'admin',       'AD', true, 'admin123'),
  ('00000000-0000-0000-0000-000000000002', 'staff',    'Staff Member',    'staff',   'fnb',         'SM', true, 'staff123'),
  ('00000000-0000-0000-0000-000000000003', 'manager1', 'Khun Malee',      'manager', 'frontdesk',   'KM', true, 'manager123'),
  ('00000000-0000-0000-0000-000000000004', 'hk01',     'Nong Ploy',       'staff',   'housekeeping','NP', true, 'hk123'),
  ('00000000-0000-0000-0000-000000000005', 'fnb01',    'Khun Somchai',    'staff',   'fnb',         'KS', true, 'fnb123')
ON CONFLICT (id) DO NOTHING;

-- 7c. Seed sample image URLs for existing menu items
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=80' WHERE id = 'M-01' AND image_url IS NULL;
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300&q=80' WHERE id = 'M-02' AND image_url IS NULL;
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=300&q=80' WHERE id = 'M-03' AND image_url IS NULL;
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&q=80' WHERE id = 'M-04' AND image_url IS NULL;
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8?w=300&q=80' WHERE id = 'M-05' AND image_url IS NULL;
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&q=80' WHERE id = 'M-06' AND image_url IS NULL;
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=300&q=80' WHERE id = 'M-11' AND image_url IS NULL;
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=300&q=80' WHERE id = 'M-16' AND image_url IS NULL;
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1547592180-85f173990554?w=300&q=80' WHERE id = 'M-17' AND image_url IS NULL;
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=300&q=80' WHERE id = 'M-21' AND image_url IS NULL;

-- ─────────────────────────────────────────────────────────────
-- 8. VERIFICATION QUERIES (optional — run to confirm setup)
-- ─────────────────────────────────────────────────────────────

-- SELECT 'inventory_items' AS tbl, COUNT(*) FROM inventory_items
-- UNION ALL
-- SELECT 'user_profiles',          COUNT(*) FROM user_profiles
-- UNION ALL
-- SELECT 'menu_items with images',  COUNT(*) FROM menu_items WHERE image_url IS NOT NULL;
