import { Controller, Get } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/auth.decorators';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@Roles(UserRole.ADMIN, UserRole.DRIVER)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  getStats() {
    return this.dashboardService.getStats();
  }
}
