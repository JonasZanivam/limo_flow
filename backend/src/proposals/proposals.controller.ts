import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import type { Response } from 'express';
import { Roles } from '../common/decorators/auth.decorators';
import {
  type AuthenticatedUser,
  CurrentUser,
} from '../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { CreateProposalTramiteDto } from './dto/create-proposal-tramite.dto';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { UpdateProposalDto } from './dto/update-proposal.dto';
import { ProposalTramitesService } from './proposal-tramites.service';
import { ProposalsService } from './proposals.service';

@Controller('proposals')
@Roles(UserRole.ADMIN)
export class ProposalsController {
  constructor(
    private readonly proposalsService: ProposalsService,
    private readonly proposalTramitesService: ProposalTramitesService,
  ) {}

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.proposalsService.findAll(query);
  }

  @Get(':id/whatsapp-url')
  getWhatsAppUrl(@Param('id', ParseUUIDPipe) id: string) {
    return this.proposalsService.getWhatsAppUrl(id);
  }

  @Get(':id/pdf')
  @Header('Content-Type', 'application/pdf')
  async downloadPdf(
    @Param('id', ParseUUIDPipe) id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const buffer = await this.proposalsService.generatePdf(id);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="proposta-${id.slice(0, 8)}.pdf"`,
    );

    return new StreamableFile(buffer);
  }

  @Get(':id/tramites')
  findTramites(@Param('id', ParseUUIDPipe) id: string) {
    return this.proposalTramitesService.findByProposalId(id);
  }

  @Post(':id/tramites')
  createTramite(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateProposalTramiteDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.proposalTramitesService.createManual(id, dto, user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.proposalsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateProposalDto) {
    return this.proposalsService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProposalDto,
  ) {
    return this.proposalsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.proposalsService.remove(id);
  }
}
