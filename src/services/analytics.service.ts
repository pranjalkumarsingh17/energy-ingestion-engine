import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class AnalyticsService {
  constructor(@Inject('PG') private db: Pool) {}

  async getPerformance(vehicleId: string) {
    const { rows } = await this.db.query(
      `SELECT
        SUM(v.kwh_delivered_dc) AS total_dc,
        SUM(m.kwh_consumed_ac) AS total_ac,
        SUM(v.kwh_delivered_dc) / NULLIF(SUM(m.kwh_consumed_ac),0) AS efficiency,
        AVG(v.battery_temp) AS avg_battery_temp
       FROM vehicle_telemetry v
       JOIN vehicle_meter_map vm ON v.vehicle_id = vm.vehicle_id
       JOIN meter_telemetry m ON vm.meter_id = m.meter_id
       WHERE v.vehicle_id=$1
         AND v.ts >= NOW() - INTERVAL '24 hours'
         AND m.ts >= NOW() - INTERVAL '24 hours'`,
      [vehicleId]
    );
    return rows[0];
  }
}