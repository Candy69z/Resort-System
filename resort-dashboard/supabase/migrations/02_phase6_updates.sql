-- ================================================================
-- Resort PMS & POS — Phase 6 Schema Updates
-- ================================================================
-- Run in Supabase SQL Editor after 01_initial_schema.sql.
-- All statements use IF NOT EXISTS so re-running is safe.
--
-- New tables:
--   1. bookings          — Check-in/out records, folio total
--   2. booking_addons    — Breakfast, packages, etc.
--   3. activities        — Activity catalogue
--   4. activity_bookings — Activity reservations
--   5. staff_attendance  — Clock-in/out (hardware integration-ready)
-- ================================================================


-- ────────────────────────────────────────────────────────────────
-- 1. BOOKINGS
-- ────────────────────────────────────────────────────────────────
-- Tracks a guest's room reservation lifecycle from
-- confirmed → checked_in → checked_out.
-- F&B charges are aggregated from the orders table at check-out.

CREATE TABLE IF NOT EXISTS bookings (
  id                  TEXT        PRIMARY KEY,
  room_id             TEXT        REFERENCES rooms (id) ON DELETE SET NULL,
  guest_id            TEXT,                           -- future: FK to guest_profiles
  guest_name          TEXT        NOT NULL,
  guest_phone         TEXT        NOT NULL,
  guest_email         TEXT,
  check_in            DATE        NOT NULL,
  check_out           DATE        NOT NULL,
  status              TEXT        NOT NULL DEFAULT 'confirmed'
    CHECK (status IN ('confirmed', 'checked_in', 'checked_out', 'cancelled')),
  total_amount        NUMERIC(10, 2) NOT NULL DEFAULT 0,
  -- Payment recorded at check-out
  payment_method      TEXT
    CHECK (payment_method IN ('cash', 'credit_card', 'promptpay')),
  payment_ref         TEXT,
  payment_slip_url    TEXT,
  paid_at             TIMESTAMPTZ,
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────────
-- 2. BOOKING ADD-ONS
-- ────────────────────────────────────────────────────────────────
-- Line-items added at booking time (e.g. breakfast, packages).
-- F&B orders placed during the stay live in the orders table.

CREATE TABLE IF NOT EXISTS booking_addons (
  id            UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id    TEXT    NOT NULL REFERENCES bookings (id) ON DELETE CASCADE,
  name          TEXT    NOT NULL,
  price         NUMERIC(10, 2) NOT NULL DEFAULT 0,
  quantity      INT     NOT NULL DEFAULT 1,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────────
-- 3. ACTIVITIES
-- ────────────────────────────────────────────────────────────────
-- Master catalogue of activities offered by the resort.
-- Managed via the /admin page (future phase: db-backed CRUD).

CREATE TABLE IF NOT EXISTS activities (
  id              TEXT        PRIMARY KEY,
  name_en         TEXT        NOT NULL,
  name_th         TEXT        NOT NULL DEFAULT '',
  category        TEXT        NOT NULL DEFAULT 'workshop'
    CHECK (category IN ('workshop', 'outdoor', 'event')),
  price           NUMERIC(10, 2) NOT NULL DEFAULT 0,
  max_capacity    INT         NOT NULL DEFAULT 10,
  duration        TEXT,               -- e.g. "1.5 hours"
  schedule        TEXT,               -- e.g. "Fri/Sat alternating"
  description     TEXT,
  is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────────
-- 4. ACTIVITY BOOKINGS
-- ────────────────────────────────────────────────────────────────
-- Records a guest's reservation for a specific activity session.
-- scheduled_time is optional — some activities are walk-in.

CREATE TABLE IF NOT EXISTS activity_bookings (
  id              TEXT        PRIMARY KEY,
  activity_id     TEXT        NOT NULL REFERENCES activities (id) ON DELETE CASCADE,
  activity_name   TEXT        NOT NULL,   -- snapshot at booking time
  room_id         TEXT        REFERENCES rooms (id) ON DELETE SET NULL,
  room_name       TEXT,                   -- snapshot
  guest_name      TEXT        NOT NULL,
  scheduled_date  DATE        NOT NULL,
  scheduled_time  TIME,
  slots           INT         NOT NULL DEFAULT 1 CHECK (slots > 0),
  total_price     NUMERIC(10, 2) NOT NULL DEFAULT 0,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────────
-- 5. STAFF ATTENDANCE
-- ────────────────────────────────────────────────────────────────
-- Biometric/RFID-ready attendance log.
-- clock_in  — set by hardware scanner or manual entry.
-- clock_out — set when staff clocks out; NULL means still on shift.
-- duration_minutes — auto-computed by DB (generated column).

CREATE TABLE IF NOT EXISTS staff_attendance (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id         TEXT        NOT NULL,    -- links to future staff_profiles
  staff_name       TEXT        NOT NULL,    -- name snapshot for display
  clock_in         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  clock_out        TIMESTAMPTZ,
  -- Auto-computed when clock_out is set; NULL while still on shift
  duration_minutes NUMERIC     GENERATED ALWAYS AS (
    CASE
      WHEN clock_out IS NOT NULL
        THEN EXTRACT(EPOCH FROM (clock_out - clock_in)) / 60.0
      ELSE NULL
    END
  ) STORED,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ────────────────────────────────────────────────────────────────
-- INDEXES
-- ────────────────────────────────────────────────────────────────

-- Bookings: fast look-ups for active room bookings and date range queries
CREATE INDEX IF NOT EXISTS idx_bookings_room_status
  ON bookings (room_id, status);

CREATE INDEX IF NOT EXISTS idx_bookings_dates
  ON bookings (check_in, check_out);

-- Activity bookings: filter by activity + date
CREATE INDEX IF NOT EXISTS idx_act_bookings_activity_date
  ON activity_bookings (activity_id, scheduled_date);

-- Staff attendance: per-staff clock-in history
CREATE INDEX IF NOT EXISTS idx_attendance_staff_clockin
  ON staff_attendance (staff_id, clock_in DESC);


-- ────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (disabled for development)
-- ────────────────────────────────────────────────────────────────

ALTER TABLE bookings          DISABLE ROW LEVEL SECURITY;
ALTER TABLE booking_addons    DISABLE ROW LEVEL SECURITY;
ALTER TABLE activities        DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE staff_attendance  DISABLE ROW LEVEL SECURITY;


-- ────────────────────────────────────────────────────────────────
-- SEED DATA
-- ────────────────────────────────────────────────────────────────

-- ── Activities (mirrors mock-data.ts) ────────────────────────────

INSERT INTO activities (id, name_en, name_th, category, price, max_capacity, duration, description)
VALUES
  ('ACT-01', 'Terrarium Workshop', 'เวิร์กชอปทำเทอร์ราเรียม', 'workshop', 350,  8, '1.5 hours', 'Create your own mini garden in a glass jar. Various jar sizes available.'),
  ('ACT-02', 'Canvas Painting',    'วาดภาพสีน้ำ',              'workshop', 250, 10, '2 hours',   'Paint the Lampang landscape on canvas with local artist guidance.'),
  ('ACT-03', 'Kayak Trip',         'พายเรือคายัค',             'outdoor',  450,  6, '3 hours',   'Guided kayak trip along the river. Life jacket & equipment included.'),
  ('ACT-04', 'Rock Climbing',      'ปีนผา',                    'outdoor',  500,  4, '4 hours',   'Beginner-friendly rock climbing with experienced guide.'),
  ('ACT-05', 'Live DJ Night',      'ไลฟ์ดีเจไนท์',             'event',      0, 50, '4 hours',   'Friday/Saturday alternating. Chill beats under the stars.')
ON CONFLICT (id) DO NOTHING;

-- ── Sample bookings (mirror mock-data.ts bookings) ────────────────

INSERT INTO bookings (id, room_id, guest_name, guest_phone, check_in, check_out, status, total_amount, created_at)
VALUES
  ('BK-001', 'TH-01', 'Somchai Kaewkla',  '0812345678', '2026-04-03', '2026-04-05', 'checked_in',  1776, '2026-04-01T10:00:00Z'),
  ('BK-002', 'RF-01', 'Anna Schmidt',     '0898765432', '2026-04-02', '2026-04-04', 'checked_in',  2076, '2026-03-28T14:00:00Z'),
  ('BK-003', 'RF-02', 'Tanaka Yuki',      '0921112222', '2026-04-03', '2026-04-06', 'checked_in',  1764, '2026-04-01T09:00:00Z'),
  ('BK-004', 'TE-01', 'Lisa Manobal',     '0953334444', '2026-04-01', '2026-04-03', 'checked_in',  1876, '2026-03-25T16:00:00Z'),
  ('BK-005', 'CF-01', 'Mike Johnson',     '0885556666', '2026-04-03', '2026-04-05', 'checked_in',   400, '2026-04-02T18:00:00Z'),
  ('BK-006', 'CR-01', 'Ploy Chaiwan',     '0867778888', '2026-04-02', '2026-04-05', 'checked_in',  1176, '2026-03-30T11:00:00Z'),
  ('BK-007', 'TH-02', 'David Park',       '0919990000', '2026-04-08', '2026-04-12', 'confirmed',   3152, '2026-04-06T08:00:00Z'),
  ('BK-008', 'RF-03', 'Wanchai Boonrod',  '0842223333', '2026-04-09', '2026-04-11', 'confirmed',   1176, '2026-04-07T09:00:00Z'),
  ('BK-009', 'TE-02', 'Sarah Lee',        '0831110000', '2026-04-10', '2026-04-14', 'confirmed',   3552, '2026-04-07T10:00:00Z'),
  ('BK-010', 'CF-02', 'Priya Sharma',     '0904445555', '2026-04-11', '2026-04-13', 'confirmed',    400, '2026-04-07T11:00:00Z')
ON CONFLICT (id) DO NOTHING;


-- ────────────────────────────────────────────────────────────────
-- Verify with:
--   SELECT COUNT(*) FROM bookings;          -- expect 10
--   SELECT COUNT(*) FROM activities;        -- expect  5
--   SELECT COUNT(*) FROM staff_attendance;  -- expect  0 (runtime data)
-- ────────────────────────────────────────────────────────────────
