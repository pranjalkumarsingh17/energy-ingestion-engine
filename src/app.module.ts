import { Module } from '@nestjs/common';
import { TelemetryModule } from './modules/telemetry.module';
import { AnalyticsModule } from './modules/analytics.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [DatabaseModule, TelemetryModule, AnalyticsModule],
})
export class AppModule {}