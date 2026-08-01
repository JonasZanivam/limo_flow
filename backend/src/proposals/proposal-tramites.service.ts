import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ProposalTramiteType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProposalTramiteDto } from './dto/create-proposal-tramite.dto';
import { TRAMITE_TYPE_TO_STATUS } from './proposal-tramite.constants';

const tramiteSelect = {
  id: true,
  proposalId: true,
  type: true,
  description: true,
  userId: true,
  user: {
    select: {
      id: true,
      name: true,
    },
  },
  createdAt: true,
} satisfies Prisma.ProposalTramiteSelect;

@Injectable()
export class ProposalTramitesService {
  constructor(private readonly prisma: PrismaService) {}

  async findByProposalId(proposalId: string) {
    await this.assertProposalExists(proposalId);

    const tramites = await this.prisma.proposalTramite.findMany({
      where: { proposalId },
      select: tramiteSelect,
      orderBy: { createdAt: 'asc' },
    });

    return tramites;
  }

  async createManual(
    proposalId: string,
    dto: CreateProposalTramiteDto,
    userId: string,
  ) {
    await this.assertProposalExists(proposalId);

    const status = TRAMITE_TYPE_TO_STATUS[dto.type];

    return this.prisma.$transaction(async (tx) => {
      if (status) {
        await tx.proposal.update({
          where: { id: proposalId },
          data: { status },
        });
      }

      return tx.proposalTramite.create({
        data: {
          proposalId,
          type: dto.type,
          description: dto.description?.trim() || null,
          userId,
        },
        select: tramiteSelect,
      });
    });
  }

  async log(
    proposalId: string,
    type: ProposalTramiteType,
    options?: {
      description?: string;
      userId?: string;
    },
  ) {
    await this.assertProposalExists(proposalId);

    return this.prisma.proposalTramite.create({
      data: {
        proposalId,
        type,
        description: options?.description?.trim() || null,
        userId: options?.userId ?? null,
      },
      select: tramiteSelect,
    });
  }

  private async assertProposalExists(proposalId: string) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id: proposalId },
      select: { id: true },
    });

    if (!proposal) {
      throw new NotFoundException('Proposta não encontrada');
    }
  }
}
