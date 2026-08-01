import { Injectable } from '@nestjs/common';
import { EventStatus, PaymentStatus, ProposalStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [
      weddingsToday,
      proposalsWaiting,
      pendingPayments,
      monthlyEvents,
      monthlyRevenueAgg,
      nextEvent,
    ] = await Promise.all([
      this.prisma.event.count({
        where: {
          status: EventStatus.CONFIRMED,
          startAt: { lte: endOfDay },
          endAt: { gte: startOfDay },
        },
      }),
      this.prisma.proposal.count({
        where: { status: ProposalStatus.WAITING },
      }),
      this.prisma.payment.count({
        where: {
          status: { in: [PaymentStatus.PENDING, PaymentStatus.OVERDUE] },
        },
      }),
      this.prisma.event.count({
        where: {
          startAt: { gte: startOfMonth, lte: endOfMonth },
        },
      }),
      this.prisma.payment.aggregate({
        where: {
          status: PaymentStatus.PAID,
          paidAt: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { amount: true },
      }),
      this.prisma.event.findFirst({
        where: {
          status: EventStatus.CONFIRMED,
          startAt: { gte: now },
        },
        orderBy: { startAt: 'asc' },
        select: {
          id: true,
          startAt: true,
          endAt: true,
          client: {
            select: {
              brideName: true,
              groomName: true,
            },
          },
        },
      }),
    ]);

    return {
      weddingsToday,
      proposalsWaiting,
      pendingPayments,
      monthlyEvents,
      monthlyRevenue: Number(monthlyRevenueAgg._sum.amount ?? 0),
      nextEvent: nextEvent
        ? {
            id: nextEvent.id,
            startAt: nextEvent.startAt.toISOString(),
            endAt: nextEvent.endAt.toISOString(),
            couple: `${nextEvent.client.brideName} & ${nextEvent.client.groomName}`,
          }
        : null,
    };
  }
}
