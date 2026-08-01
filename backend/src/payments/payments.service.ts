import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaymentStatus, Prisma } from '@prisma/client';
import {
  buildPaginatedResponse,
  getPaginationParams,
} from '../common/utils/pagination';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentsQueryDto } from './dto/payments-query.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

const paymentSelect = {
  id: true,
  amount: true,
  type: true,
  status: true,
  method: true,
  dueDate: true,
  paidAt: true,
  clientId: true,
  eventId: true,
  client: {
    select: {
      id: true,
      brideName: true,
      groomName: true,
    },
  },
  event: {
    select: {
      id: true,
      startAt: true,
      status: true,
    },
  },
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.PaymentSelect;

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(query: PaymentsQueryDto) {
    const { page, limit, skip } = getPaginationParams(query.page, query.limit);
    const where = this.buildWhere(query);

    return Promise.all([
      this.prisma.payment.findMany({
        where,
        select: paymentSelect,
        orderBy: [{ dueDate: { sort: 'asc', nulls: 'last' } }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.payment.count({ where }),
    ]).then(([data, total]) =>
      buildPaginatedResponse(
        data.map((item) => this.serializePayment(item)),
        total,
        page,
        limit,
      ),
    );
  }

  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      select: paymentSelect,
    });

    if (!payment) {
      throw new NotFoundException('Pagamento não encontrado');
    }

    return this.serializePayment(payment);
  }

  async create(dto: CreatePaymentDto) {
    await this.validateClient(dto.clientId);
    await this.validateEvent(dto.eventId);

    const status = dto.status ?? PaymentStatus.PENDING;
    const paidAt =
      status === PaymentStatus.PAID
        ? dto.paidAt
          ? new Date(dto.paidAt)
          : new Date()
        : null;

    const payment = await this.prisma.payment.create({
      data: {
        amount: dto.amount,
        type: dto.type,
        status,
        method: dto.method ?? null,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        paidAt,
        clientId: dto.clientId,
        eventId: dto.eventId ?? null,
      },
      select: paymentSelect,
    });

    return this.serializePayment(payment);
  }

  async update(id: string, dto: UpdatePaymentDto) {
    await this.findOne(id);

    if (dto.clientId) {
      await this.validateClient(dto.clientId);
    }

    if (dto.eventId !== undefined && dto.eventId !== null) {
      await this.validateEvent(dto.eventId);
    }

    const data: Prisma.PaymentUpdateInput = {};

    if (dto.amount !== undefined) data.amount = dto.amount;
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.method !== undefined) data.method = dto.method;
    if (dto.dueDate !== undefined) {
      data.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
    }
    if (dto.clientId !== undefined) {
      data.client = { connect: { id: dto.clientId } };
    }
    if (dto.eventId !== undefined) {
      data.event = dto.eventId
        ? { connect: { id: dto.eventId } }
        : { disconnect: true };
    }

    if (dto.status !== undefined) {
      data.status = dto.status;

      if (dto.status === PaymentStatus.PAID && dto.paidAt === undefined) {
        data.paidAt = new Date();
      }

      if (dto.status !== PaymentStatus.PAID && dto.paidAt === undefined) {
        data.paidAt = null;
      }
    }

    if (dto.paidAt !== undefined) {
      data.paidAt = dto.paidAt ? new Date(dto.paidAt) : null;
    }

    const payment = await this.prisma.payment.update({
      where: { id },
      data,
      select: paymentSelect,
    });

    return this.serializePayment(payment);
  }

  async remove(id: string) {
    await this.findOne(id);

    try {
      const payment = await this.prisma.payment.delete({
        where: { id },
        select: paymentSelect,
      });

      return this.serializePayment(payment);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new ConflictException(
          'Pagamento possui registros vinculados e não pode ser excluído',
        );
      }

      throw error;
    }
  }

  async getClientBalance(clientId: string) {
    await this.validateClient(clientId);

    const [paid, pending] = await Promise.all([
      this.prisma.payment.aggregate({
        where: { clientId, status: PaymentStatus.PAID },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: {
          clientId,
          status: { in: [PaymentStatus.PENDING, PaymentStatus.OVERDUE] },
        },
        _sum: { amount: true },
      }),
    ]);

    return {
      clientId,
      paidTotal: Number(paid._sum.amount ?? 0),
      pendingTotal: Number(pending._sum.amount ?? 0),
    };
  }

  private serializePayment(
    payment: Prisma.PaymentGetPayload<{ select: typeof paymentSelect }>,
  ) {
    return {
      ...payment,
      amount: Number(payment.amount),
    };
  }

  private buildWhere(query: PaymentsQueryDto): Prisma.PaymentWhereInput {
    const term = query.search?.trim();
    const filters: Prisma.PaymentWhereInput[] = [];

    if (query.status) {
      filters.push({ status: query.status });
    }

    if (term) {
      filters.push({
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
      });
    }

    if (filters.length === 0) return {};
    if (filters.length === 1) return filters[0];

    return { AND: filters };
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

  private async validateEvent(eventId?: string | null) {
    if (!eventId) return;

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true },
    });

    if (!event) {
      throw new NotFoundException('Evento não encontrado');
    }
  }
}
