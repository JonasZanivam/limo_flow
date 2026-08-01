import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { COMPANY_SETTINGS_ID } from './company-settings.constants';
import { UpdateCompanySettingsDto } from './dto/update-company-settings.dto';

const companySettingsSelect = {
  id: true,
  legalName: true,
  tradeName: true,
  cnpj: true,
  street: true,
  number: true,
  complement: true,
  neighborhood: true,
  city: true,
  state: true,
  zipCode: true,
  phone: true,
  email: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.CompanySettingsSelect;

export type CompanySettingsRecord = Prisma.CompanySettingsGetPayload<{
  select: typeof companySettingsSelect;
}>;

@Injectable()
export class CompanySettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get() {
    const settings = await this.prisma.companySettings.findUnique({
      where: { id: COMPANY_SETTINGS_ID },
      select: companySettingsSelect,
    });

    if (!settings) {
      throw new NotFoundException(
        'Parâmetros da empresa não configurados. Execute o seed ou salve os dados em Parâmetros.',
      );
    }

    return settings;
  }

  async upsert(dto: UpdateCompanySettingsDto) {
    const data = this.normalizeDto(dto);

    const settings = await this.prisma.companySettings.upsert({
      where: { id: COMPANY_SETTINGS_ID },
      create: {
        id: COMPANY_SETTINGS_ID,
        ...data,
      },
      update: data,
      select: companySettingsSelect,
    });

    return settings;
  }

  private normalizeDto(dto: UpdateCompanySettingsDto) {
    return {
      legalName: dto.legalName.trim(),
      tradeName: dto.tradeName?.trim() || null,
      cnpj: dto.cnpj.replace(/\D/g, ''),
      street: dto.street.trim(),
      number: dto.number.trim(),
      complement: dto.complement?.trim() || null,
      neighborhood: dto.neighborhood.trim(),
      city: dto.city.trim(),
      state: dto.state.trim().toUpperCase(),
      zipCode: dto.zipCode.replace(/\D/g, ''),
      phone: dto.phone?.trim() || null,
      email: dto.email?.trim().toLowerCase() || null,
    };
  }
}
