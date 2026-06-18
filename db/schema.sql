-- =========================
-- UNIT
-- =========================
create table unit (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text
);

-- =========================
-- MEETING ROOM
-- =========================
create table meeting_room (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  capacity int not null
);

-- =========================
-- RESERVATIONS
-- =========================
create table reservations (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid references unit(id) on delete cascade,
  meeting_room_id uuid references meeting_room(id) on delete cascade,
  capacity int not null,
  date date not null,
  start_time time not null,
  end_time time not null,
  participants_count int not null,
  amount numeric not null default 0
);

-- =========================
-- CONSUMPTION TYPES (checkbox options)
-- =========================
create table consumption_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text
);

-- =========================
-- JUNCTION TABLE
-- =========================
create table reservation_consumptions (
  reservation_id uuid references reservations(id) on delete cascade,
  consumption_type_id uuid references consumption_types(id) on delete cascade,
  primary key (reservation_id, consumption_type_id)
);
