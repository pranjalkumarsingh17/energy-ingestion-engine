import { Controller, Post, Body } from '@nestjs/common';
import { TelemetryService } from '../services/telemetry.service';

@Controller('v1/telemetry')
export class TelemetryController {
  constructor(private readonly service: TelemetryService) {}

  @Post()
  ingest(@Body() payload: any) {
    return this.service.ingest(payload);
  }
}