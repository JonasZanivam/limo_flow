import {
  IsInt,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

const PLATE_REGEX =
  /^([A-Z]{3}-?\d{4}|[A-Z]{3}\d[A-Z]\d{2})$/i;

export class CreateVehicleDto {
  @IsString()
  @MinLength(7)
  @MaxLength(8)
  @Matches(PLATE_REGEX, {
    message: 'Placa inválida. Use o formato ABC1234 ou ABC1D23',
  })
  plate!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  model!: string;

  @IsInt()
  @Min(1)
  @Max(60)
  capacity!: number;
}
