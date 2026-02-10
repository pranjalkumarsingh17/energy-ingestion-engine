import { Controller, Get, Param } from '@nestjs/common';
import { AnalyticsService } from '../services/analytics.service';

@Controller('v1/analytics')
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  @Get('performance/:vehicleId')
  get(@Param('vehicleId') vehicleId: string) {
    return this.service.getPerformance(vehicleId);
  }
}