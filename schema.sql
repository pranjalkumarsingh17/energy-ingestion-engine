-- VEHICLE <-> METER MAPPING
CREATE TABLE IF NOT EXISTS vehicle_meter_map (
  vehicle_id TEXT PRIMARY KEY,
  meter_id TEXT NOT NULL
);

-- HOT TABLES
CREATE TABLE IF NOT EXISTS current_vehicle_status (
  vehicle_id TEXT PRIMARY KEY,
  soc NUMERIC,
  battery_temp NUMERIC,
  last_kwh_delivered_dc NUMERIC,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS current_meter_status (
  meter_id TEXT PRIMARY KEY,
  voltage NUMERIC,
  last_kwh_consumed_ac NUMERIC,
  updated_at TIMESTAMPTZ
);

-- COLD TABLES (PARTITIONED)
CREATE TABLE IF NOT EXISTS vehicle_telemetry (
  id BIGSERIAL PRIMARY KEY,
  vehicle_id TEXT NOT NULL,
  soc NUMERIC,
  kwh_delivered_dc NUMERIC,
  battery_temp NUMERIC,
  ts TIMESTAMPTZ NOT NULL
) PARTITION BY RANGE (ts);

CREATE TABLE IF NOT EXISTS meter_telemetry (
  id BIGSERIAL PRIMARY KEY,
  meter_id TEXT NOT NULL,
  kwh_consumed_ac NUMERIC,
  voltage NUMERIC,
  ts TIMESTAMPTZ NOT NULL
) PARTITION BY RANGE (ts);

-- INDEXES (CRITICAL FOR SCALE)
CREATE INDEX IF NOT EXISTS idx_vehicle_ts
ON vehicle_telemetry (vehicle_id, ts);

CREATE INDEX IF NOT EXISTS idx_meter_ts
ON meter_telemetry (meter_id, ts);