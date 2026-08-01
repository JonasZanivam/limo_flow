import {
  BadRequestException,
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
} from '../whatsapp/templates';
import { buildContractContent } from './contract-template';
import { CreateContractDto } from './dto/create-contract.dto';

const contractSelect = {
  id: true,
  content: true,
  clientId: true,
  proposalId: true,
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
  proposal: {
    select: {
      id: true,
      value: true,
      hours: true,
      status: true,
      vehicle: {
        select: {
          id: true,
          plate: true,
          model: true,
        },
      },
    },
  },
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ContractSelect;

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
});

@Injectable()
export class ContractsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfService: PdfService,
  ) {}

  findAll(query: PaginationQueryDto) {
    const { page, limit, skip } = getPaginationParams(query.page, query.limit);
    const where = this.buildSearchWhere(query.search);

    return Promise.all([
      this.prisma.contract.findMany({
        where,
        select: contractSelect,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.contract.count({ where }),
    ]).then(([data, total]) =>
      buildPaginatedResponse(
        data.map((item) => this.serializeContract(item)),
        total,
        page,
        limit,
      ),
    );
  }

  async findOne(id: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id },
      select: contractSelect,
    });

    if (!contract) {
      throw new NotFoundException('Contrato não encontrado');
    }

    return this.serializeContract(contract);
  }

  async create(dto: CreateContractDto) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id: dto.proposalId },
      select: {
        id: true,
        status: true,
        value: true,
        hours: true,
        clientId: true,
        contract: { select: { id: true } },
        client: {
          select: {
            brideName: true,
            groomName: true,
            weddingDate: true,
            church: true,
            venue: true,
          },
        },
        vehicle: {
          select: {
            model: true,
            plate: true,
          },
        },
      },
    });

    if (!proposal) {
      throw new NotFoundException('Proposta não encontrada');
    }

    if (proposal.contract) {
      throw new ConflictException('Proposta já possui contrato');
    }

    if (proposal.status !== 'ACCEPTED') {
      throw new BadRequestException(
        'Somente propostas aceitas podem gerar contrato',
      );
    }

    const content = buildContractContent({
      brideName: proposal.client.brideName,
      groomName: proposal.client.groomName,
      weddingDate: proposal.client.weddingDate
        ? dateFormatter.format(new Date(proposal.client.weddingDate))
        : 'A definir',
      value: Number(proposal.value).toFixed(2).replace('.', ','),
      hours: String(proposal.hours),
      vehicle: proposal.vehicle
        ? `${proposal.vehicle.model} (${proposal.vehicle.plate})`
        : 'A definir',
      church: proposal.client.church ?? 'A definir',
      venue: proposal.client.venue ?? 'A definir',
    });

    const contract = await this.prisma.contract.create({
      data: {
        content,
        clientId: proposal.clientId,
        proposalId: proposal.id,
      },
      select: contractSelect,
    });

    return this.serializeContract(contract);
  }

  async remove(id: string) {
    await this.findOne(id);

    const contract = await this.prisma.contract.delete({
      where: { id },
      select: contractSelect,
    });

    return this.serializeContract(contract);
  }

  async getWhatsAppUrl(id: string) {
    const contract = await this.findOne(id);
    const phone = contract.client.phones[0];

    if (!phone) {
      throw new NotFoundException('Cliente sem telefone cadastrado');
    }

    const message = renderTemplate('CONTRACT', {
      noiva: contract.client.brideName,
      noivo: contract.client.groomName,
      data: contract.client.weddingDate
        ? dateFormatter.format(new Date(contract.client.weddingDate))
        : 'a definir',
    });

    return { url: buildWhatsAppUrl(phone, message) };
  }

  async generatePdf(id: string) {
    const contract = await this.findOne(id);

    return this.pdfService.generateDocument('Contrato — LimoFlow', [
      { text: contract.content, options: { align: 'left' } },
    ]);
  }

  private serializeContract(
    contract: Prisma.ContractGetPayload<{ select: typeof contractSelect }>,
  ) {
    return {
      ...contract,
      proposal: {
        ...contract.proposal,
        value: Number(contract.proposal.value),
      },
    };
  }

  private buildSearchWhere(search?: string): Prisma.ContractWhereInput {
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
}
