import { ProposalTramiteType } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { MANUAL_TRAMITE_TYPES } from '../proposal-tramite.constants';

const manualTramiteTypes = MANUAL_TRAMITE_TYPES as ProposalTramiteType[];

export class CreateProposalTramiteDto {
  @IsEnum(manualTramiteTypes)
  type: ProposalTramiteType;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;
}
