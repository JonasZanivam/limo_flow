import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import type { Response } from 'express';
import { Roles } from '../common/decorators/auth.decorators';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';

@Controller('contracts')
@Roles(UserRole.ADMIN)
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.contractsService.findAll(query);
  }

  @Get(':id/whatsapp-url')
  getWhatsAppUrl(@Param('id', ParseUUIDPipe) id: string) {
    return this.contractsService.getWhatsAppUrl(id);
  }

  @Get(':id/pdf')
  @Header('Content-Type', 'application/pdf')
  async downloadPdf(
    @Param('id', ParseUUIDPipe) id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const buffer = await this.contractsService.generatePdf(id);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="contrato-${id.slice(0, 8)}.pdf"`,
    );

    return new StreamableFile(buffer);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.contractsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateContractDto) {
    return this.contractsService.create(dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.contractsService.remove(id);
  }
}
