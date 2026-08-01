import { Module } from '@nestjs/common';
import { ProposalTramitesService } from './proposal-tramites.service';
import { ProposalsController } from './proposals.controller';
import { ProposalsService } from './proposals.service';

@Module({
  controllers: [ProposalsController],
  providers: [ProposalsService, ProposalTramitesService],
  exports: [ProposalsService, ProposalTramitesService],
})
export class ProposalsModule {}
