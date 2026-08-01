import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { ProposalStatus } from '@prisma/client';

export class CreateProposalDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(9999999.99)
  value!: number;

  @IsInt()
  @Min(1)
  @Max(24)
  hours!: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(99999.99)
  mileage?: number;

  @IsOptional()
  @IsEnum(ProposalStatus)
  status?: ProposalStatus;

  @IsUUID()
  clientId!: string;

  @IsOptional()
  @IsUUID()
  vehicleId?: string;
}
