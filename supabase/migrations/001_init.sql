-- trips 路书表
CREATE TABLE trips (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL DEFAULT auth.uid(),
  title       TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  cover_lng   DOUBLE PRECISION,
  cover_lat   DOUBLE PRECISION,
  cover_zoom  INTEGER DEFAULT 10,
  start_date  DATE,
  end_date    DATE,
  day_count   INTEGER DEFAULT 1,
  status      TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own trips" ON trips
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- waypoints 地点表
CREATE TABLE waypoints (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id     UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  day_index   INTEGER NOT NULL DEFAULT 1,
  order_index INTEGER NOT NULL DEFAULT 0,
  name        TEXT NOT NULL DEFAULT '',
  address     TEXT DEFAULT '',
  lng         DOUBLE PRECISION NOT NULL,
  lat         DOUBLE PRECISION NOT NULL,
  poi_id      TEXT DEFAULT '',
  type        TEXT DEFAULT 'waypoint' CHECK (type IN (
                'departure', 'destination', 'waypoint', 'lodgment', 'dining'
              )),
  notes       TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_waypoints_trip ON waypoints(trip_id, day_index, order_index);

ALTER TABLE waypoints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage waypoints of own trips" ON waypoints
  USING (EXISTS (
    SELECT 1 FROM trips WHERE trips.id = waypoints.trip_id AND trips.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM trips WHERE trips.id = waypoints.trip_id AND trips.user_id = auth.uid()
  ));

-- routes 路线缓存表
CREATE TABLE routes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id     UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  day_index   INTEGER NOT NULL,
  polyline    TEXT NOT NULL,
  distance    INTEGER DEFAULT 0,
  duration    INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage routes of own trips" ON routes
  USING (EXISTS (
    SELECT 1 FROM trips WHERE trips.id = routes.trip_id AND trips.user_id = auth.uid()
  ));
