import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PdfService } from '../pdf/pdf.service';
import { ProposalTramitesService } from './proposal-tramites.service';
import { ProposalsService } from './proposals.service';

describe('ProposalsService', () => {
  let service: ProposalsService;
  let prisma: {
    proposal: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      count: jest.Mock;
    };
    client: { findUnique: jest.Mock };
    vehicle: { findUnique: jest.Mock };
  };

  const mockProposal = {
    id: 'proposal-1',
    value: 5000,
    hours: 4,
    mileage: 120,
    status: 'SENT',
    clientId: 'client-1',
    vehicleId: 'vehicle-1',
    client: {
      id: 'client-1',
      brideName: 'Ana',
      groomName: 'Pedro',
      phones: ['11999990000'],
      weddingDate: new Date('2026-12-15'),
      church: 'Igreja',
      venue: 'Salão',
    },
    vehicle: {
      id: 'vehicle-1',
      plate: 'ABC1D23',
      model: 'Sprinter',
    },
    contract: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    prisma = {
      proposal: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      client: { findUnique: jest.fn() },
      vehicle: { findUnique: jest.fn() },
    };

    service = new ProposalsService(
      prisma as unknown as PrismaService,
      {
        generateDocument: jest.fn().mockResolvedValue(Buffer.from('pdf')),
      } as unknown as PdfService,
      {
        log: jest.fn().mockResolvedValue(undefined),
      } as unknown as ProposalTramitesService,
    );
  });

  it('deve listar propostas paginadas', async () => {
    prisma.proposal.findMany.mockResolvedValue([mockProposal]);
    prisma.proposal.count.mockResolvedValue(1);

    const result = await service.findAll({ page: 1, limit: 10 });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].value).toBe(5000);
  });

  it('deve lançar erro quando proposta não existe', async () => {
    prisma.proposal.findUnique.mockResolvedValue(null);

    await expect(service.findOne('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
