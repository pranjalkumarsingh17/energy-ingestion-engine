import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class TelemetryService {
  constructor(@Inject('PG') private db: Pool) {}

  async ingest(payload: any) {
    if (payload.vehicleId) {
      await this.db.query(
        `INSERT INTO vehicle_telemetry(vehicle_id,soc,kwh_delivered_dc,battery_temp,ts)
         VALUES ($1,$2,$3,$4,$5)`,
        [payload.vehicleId, payload.soc, payload.kwhDeliveredDc, payload.batteryTemp, payload.timestamp]
      );

      await this.db.query(
        `INSERT INTO current_vehicle_status VALUES ($1,$2,$3,$4,NOW())
         ON CONFLICT (vehicle_id)
         DO UPDATE SET soc=$2,battery_temp=$3,last_kwh_delivered_dc=$4,updated_at=NOW()`,
        [payload.vehicleId, payload.soc, payload.batteryTemp, payload.kwhDeliveredDc]
      );
    }
    return { status: 200, message: 'Telemetry ingested successfully' };
  }
}