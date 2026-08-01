import { Body, Controller, Get, Patch } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/auth.decorators';
import { CompanySettingsService } from './company-settings.service';
import { UpdateCompanySettingsDto } from './dto/update-company-settings.dto';

@Controller('company-settings')
@Roles(UserRole.ADMIN)
export class CompanySettingsController {
  constructor(
    private readonly companySettingsService: CompanySettingsService,
  ) {}

  @Get()
  get() {
    return this.companySettingsService.get();
  }

  @Patch()
  update(@Body() dto: UpdateCompanySettingsDto) {
    return this.companySettingsService.upsert(dto);
  }
}
