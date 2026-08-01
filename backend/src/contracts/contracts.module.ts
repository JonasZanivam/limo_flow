import { Module } from '@nestjs/common';
import { CompanySettingsModule } from '../company-settings/company-settings.module';
import { ProposalsModule } from '../proposals/proposals.module';
import { ContractsController } from './contracts.controller';
import { ContractsService } from './contracts.service';

@Module({
  imports: [CompanySettingsModule, ProposalsModule],
  controllers: [ContractsController],
  providers: [ContractsService],
})
export class ContractsModule {}
