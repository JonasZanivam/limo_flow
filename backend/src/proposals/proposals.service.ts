import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import {
  buildPaginatedResponse,
  getPaginationParams,
} from '../common/utils/pagination';
import { PdfService } from '../pdf/pdf.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  buildWhatsAppUrl,
  renderTemplate,
} from '../common/whatsapp/templates';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { UpdateProposalDto } from './dto/update-proposal.dto';
import { ProposalTramitesService } from './proposal-tramites.service';

const proposalSelect = {
  id: true,
  value: true,
  hours: true,
  mileage: true,
  status: true,
  clientId: true,
  vehicleId: true,
  client: {
    select: {
      id: true,
      brideName: true,
      groomName: true,
      phones: true,
      weddingDate: true,
      church: true,
      venue: true,
    },
  },
  vehicle: {
    select: {
      id: true,
      plate: true,
      model: true,
    },
  },
  contract: {
    select: {
      id: true,
    },
  },
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ProposalSelect;

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
});

@Injectable()
export class ProposalsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfService: PdfService,
    private readonly proposalTramitesService: ProposalTramitesService,
  ) {}

  findAll(query: PaginationQueryDto) {
    const { page, limit, skip } = getPaginationParams(query.page, query.limit);
    const where = this.buildSearchWhere(query.search);

    return Promise.all([
      this.prisma.proposal.findMany({
        where,
        select: proposalSelect,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.proposal.count({ where }),
    ]).then(([data, total]) =>
      buildPaginatedResponse(
        data.map((item) => this.serializeProposal(item)),
        total,
        page,
        limit,
      ),
    );
  }

  async findOne(id: string) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id },
      select: proposalSelect,
    });

    if (!proposal) {
      throw new NotFoundException('Proposta não encontrada');
    }

    return this.serializeProposal(proposal);
  }

  async create(dto: CreateProposalDto) {
    await this.validateClient(dto.clientId);
    await this.validateVehicle(dto.vehicleId);

    const proposal = await this.prisma.proposal.create({
      data: {
        value: dto.value,
        hours: dto.hours,
        mileage: dto.mileage ?? null,
        status: dto.status ?? 'SENT',
        clientId: dto.clientId,
        vehicleId: dto.vehicleId ?? null,
      },
      select: proposalSelect,
    });

    await this.proposalTramitesService.log(proposal.id, 'GENERATED');

    return this.serializeProposal(proposal);
  }

  async update(id: string, dto: UpdateProposalDto) {
    const current = await this.prisma.proposal.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!current) {
      throw new NotFoundException('Proposta não encontrada');
    }

    if (dto.clientId) {
      await this.validateClient(dto.clientId);
    }

    if (dto.vehicleId !== undefined && dto.vehicleId !== null) {
      await this.validateVehicle(dto.vehicleId);
    }

    const data: Prisma.ProposalUpdateInput = {};

    if (dto.value !== undefined) data.value = dto.value;
    if (dto.hours !== undefined) data.hours = dto.hours;
    if (dto.mileage !== undefined) data.mileage = dto.mileage;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.clientId !== undefined) {
      data.client = { connect: { id: dto.clientId } };
    }
    if (dto.vehicleId !== undefined) {
      data.vehicle = dto.vehicleId
        ? { connect: { id: dto.vehicleId } }
        : { disconnect: true };
    }

    const proposal = await this.prisma.proposal.update({
      where: { id },
      data,
      select: proposalSelect,
    });

    if (dto.status !== undefined && dto.status !== current.status) {
      await this.proposalTramitesService.log(id, dto.status);
    }

    return this.serializeProposal(proposal);
  }

  async remove(id: string) {
    await this.findOne(id);

    try {
      const proposal = await this.prisma.proposal.delete({
        where: { id },
        select: proposalSelect,
      });

      return this.serializeProposal(proposal);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new ConflictException(
          'Proposta possui registros vinculados e não pode ser excluída',
        );
      }

      throw error;
    }
  }

  async getWhatsAppUrl(id: string) {
    const proposal = await this.findOne(id);
    const phone = proposal.client.phones[0];

    if (!phone) {
      throw new NotFoundException('Cliente sem telefone cadastrado');
    }

    const message = renderTemplate('PROPOSAL', {
      noiva: proposal.client.brideName,
      noivo: proposal.client.groomName,
      data: proposal.client.weddingDate
        ? dateFormatter.format(new Date(proposal.client.weddingDate))
        : 'a definir',
      valor: proposal.value.toFixed(2).replace('.', ','),
    });

    return { url: buildWhatsAppUrl(phone, message) };
  }

  async generatePdf(id: string) {
    const proposal = await this.findOne(id);
    const vehicleLabel = proposal.vehicle
      ? `${proposal.vehicle.model} (${proposal.vehicle.plate})`
      : 'A definir';

    return this.pdfService.generateDocument('Proposta Comercial — LimoFlow', [
      {
        text: `Casal: ${proposal.client.brideName} & ${proposal.client.groomName}`,
      },
      {
        text: `Data do casamento: ${
          proposal.client.weddingDate
            ? dateFormatter.format(new Date(proposal.client.weddingDate))
            : 'A definir'
        }`,
      },
      { text: `Veículo: ${vehicleLabel}` },
      { text: `Horas contratadas: ${proposal.hours}` },
      {
        text: `Quilometragem estimada: ${
          proposal.mileage != null
            ? `${proposal.mileage.toFixed(1)} km`
            : 'Não informada'
        }`,
      },
      {
        text: `Valor: R$ ${proposal.value.toFixed(2).replace('.', ',')}`,
        options: { underline: true },
      },
      { text: `Status: ${this.formatStatus(proposal.status)}` },
    ]);
  }

  private serializeProposal(
    proposal: Prisma.ProposalGetPayload<{ select: typeof proposalSelect }>,
  ) {
    return {
      ...proposal,
      value: Number(proposal.value),
      mileage: proposal.mileage != null ? Number(proposal.mileage) : null,
      hasContract: !!proposal.contract,
    };
  }

  private formatStatus(status: string) {
    const labels: Record<string, string> = {
      SENT: 'Enviada',
      WAITING: 'Aguardando',
      ACCEPTED: 'Aceita',
      REJECTED: 'Recusada',
    };

    return labels[status] ?? status;
  }

  private buildSearchWhere(search?: string): Prisma.ProposalWhereInput {
    const term = search?.trim();
    if (!term) return {};

    return {
      OR: [
        {
          client: {
            brideName: { contains: term, mode: 'insensitive' },
          },
        },
        {
          client: {
            groomName: { contains: term, mode: 'insensitive' },
          },
        },
      ],
    };
  }

  private async validateClient(clientId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      select: { id: true },
    });

    if (!client) {
      throw new NotFoundException('Cliente não encontrado');
    }
  }

  private async validateVehicle(vehicleId?: string | null) {
    if (!vehicleId) return;

    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: { id: true },
    });

    if (!vehicle) {
      throw new NotFoundException('Veículo não encontrado');
    }
  }
}
