import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const PHONE_REGEX = /^[\d\s()+-]{8,20}$/;

export class CreateClientDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  brideName!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  groomName!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @Matches(PHONE_REGEX, {
    each: true,
    message: 'Telefone inválido',
  })
  phones!: string[];

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsDateString()
  weddingDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  church?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  venue?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @IsOptional()
  @IsUUID()
  referredById?: string;
}
