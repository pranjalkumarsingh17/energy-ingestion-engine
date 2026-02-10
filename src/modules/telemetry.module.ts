import { Module } from '@nestjs/common';
import { TelemetryController } from '../controllers/telemetry.controller';
import { TelemetryService } from '../services/telemetry.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [TelemetryController],
  providers: [TelemetryService],
})
export class TelemetryModule {}