import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { PaymentMethod, PaymentStatus, PaymentType } from '@prisma/client';

export class CreatePaymentDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(9999999.99)
  amount!: number;

  @IsEnum(PaymentType)
  type!: PaymentType;

  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsDateString()
  paidAt?: string;

  @IsUUID()
  clientId!: string;

  @IsOptional()
  @IsUUID()
  eventId?: string;
}
