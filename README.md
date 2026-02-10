# Fleet Telemetry Ingestion & Analytics Platform

## Executive Summary
This system ingests high-frequency telemetry from a distributed EV fleet consisting of
Smart Meters (AC) and Vehicles/Chargers (DC). At 10,000 devices reporting every minute,
the platform handles ~14.4 million records per day while still providing real-time
operational visibility and fast analytical insights.

The core design principle is **separating operational reads from analytical history**.

---

## Project Information

### Tech Stack
- **Runtime**: Node.js
- **Framework**: NestJS 10.x
- **Database**: PostgreSQL
- **Language**: TypeScript

#### Prerequisites
- Node.js 18+
- PostgreSQL 13+
- npm or yarn

#### Installation
```bash
npm install
```

#### Configuration
Create a `.env` file in the project root:
```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USERNAME=your_username
POSTGRES_PASSWORD=your_password
POSTGRES_DATABASE=fleet
```

#### Running the Application
```bash
# Development mode (with hot reload)
npm run start:dev

# Production mode
npm run build
npm start
```

The application will start on `http://localhost:3000`

---

## API Endpoints

### Telemetry Ingestion
**POST** `/v1/telemetry`

Ingest vehicle telemetry data.

Request body:
```json
{
  "vehicleId": "VH001",
  "soc": 85.5,
  "kwhDeliveredDc": 12.3,
  "batteryTemp": 25.0,
  "timestamp": "2026-02-10T16:23:00Z"
}
```

Response:
```json
{
  "status": 200,
  "message": "Telemetry ingested successfully"
}
```

### Analytics - Vehicle Performance (24h)
**GET** `/v1/analytics/performance/:vehicleId`

Retrieve 24-hour performance metrics for a vehicle.

Response:
```json
{
  "total_dc": 145.2,
  "total_ac": 152.3,
  "efficiency": 0.9533,
  "avg_battery_temp": 24.8
}
```

---

## Database Setup

Run the database initialization script:
```bash
psql -U postgres -d fleet -f schema.sql
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `POSTGRES_HOST` | Database host |
| `POSTGRES_PORT` | Database port |
| `POSTGRES_USERNAME` | Database user |
| `POSTGRES_PASSWORD` | Database password |
| `POSTGRES_DATABASE` | Database name |

---

## Development Commands

```bash
# Start development server with hot reload
npm run start:dev

# Build for production
npm run build

# Start production build
npm start
```

---

### Data Streams
- **Smart Meter (Grid Side)**: AC energy consumed (billing source)
- **Vehicle/Charger (Device Side)**: DC energy delivered + battery metrics

Due to conversion losses, AC consumed is always higher than DC delivered.
Efficiency degradation indicates hardware faults or leakage.

---

## Data Modeling Strategy

### 1. Vehicle ↔ Meter Mapping
```sql
vehicle_meter_map(vehicle_id → meter_id)
```
This decouples ingestion from correlation logic and avoids expensive joins at write time.

---

### 2. Hot Store (Operational)
```sql
current_vehicle_status
current_meter_status
```
- UPSERT-based
- O(1) dashboard reads
- No scans over historical data

---

### 3. Cold Store (Analytical)
```sql
vehicle_telemetry PARTITION BY RANGE(ts)
meter_telemetry   PARTITION BY RANGE(ts)
```
- Append-only
- Partition pruning for time-bounded queries
- Designed to scale to billions of rows

---

## Ingestion Strategy

Each telemetry heartbeat follows **dual-write semantics**:

1. INSERT into cold telemetry tables (audit trail)
2. UPSERT into hot tables (latest state)

This ensures correctness without sacrificing read performance.

---

## Analytics: 24-Hour Vehicle Performance

```sql
SELECT
  SUM(v.kwh_delivered_dc) AS total_dc,
  SUM(m.kwh_consumed_ac) AS total_ac,
  SUM(v.kwh_delivered_dc) / NULLIF(SUM(m.kwh_consumed_ac),0) AS efficiency,
  AVG(v.battery_temp) AS avg_battery_temp
FROM vehicle_telemetry v
JOIN vehicle_meter_map vm ON v.vehicle_id = vm.vehicle_id
JOIN meter_telemetry m ON vm.meter_id = m.meter_id
WHERE v.vehicle_id = $1
  AND v.ts >= NOW() - INTERVAL '24 hours'
  AND m.ts >= NOW() - INTERVAL '24 hours';
```