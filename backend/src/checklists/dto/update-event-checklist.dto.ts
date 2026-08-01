import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateEventChecklistDto {
  @IsOptional()
  @IsBoolean()
  carWashed?: boolean;

  @IsOptional()
  @IsBoolean()
  decorated?: boolean;

  @IsOptional()
  @IsBoolean()
  driverConfirmed?: boolean;

  @IsOptional()
  @IsBoolean()
  fuel?: boolean;

  @IsOptional()
  @IsBoolean()
  documentation?: boolean;
}
