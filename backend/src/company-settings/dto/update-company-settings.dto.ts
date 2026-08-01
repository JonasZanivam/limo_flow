import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const CNPJ_REGEX = /^\d{14}$/;
const STATE_REGEX = /^[A-Z]{2}$/;
const ZIP_CODE_REGEX = /^\d{8}$/;
const PHONE_REGEX = /^[\d\s()+-]{8,20}$/;

export class UpdateCompanySettingsDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  legalName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  tradeName?: string;

  @IsString()
  @Matches(CNPJ_REGEX, { message: 'CNPJ deve conter 14 dígitos' })
  cnpj!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  street!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(20)
  number!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  complement?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  neighborhood!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  city!: string;

  @IsString()
  @Matches(STATE_REGEX, { message: 'UF deve conter 2 letras maiúsculas' })
  state!: string;

  @IsString()
  @Matches(ZIP_CODE_REGEX, { message: 'CEP deve conter 8 dígitos' })
  zipCode!: string;

  @IsOptional()
  @IsString()
  @Matches(PHONE_REGEX, { message: 'Telefone inválido' })
  phone?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;
}
