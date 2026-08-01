import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateEventChecklistDto } from './dto/update-event-checklist.dto';

const checklistSelect = {
  id: true,
  eventId: true,
  carWashed: true,
  decorated: true,
  driverConfirmed: true,
  fuel: true,
  documentation: true,
} satisfies Prisma.EventChecklistSelect;

@Injectable()
export class ChecklistsService {
  constructor(private readonly prisma: PrismaService) {}

  async getForEvent(eventId: string, user: AuthenticatedUser) {
    await this.assertEventAccess(eventId, user);

    return this.ensureChecklist(eventId);
  }

  async updateForEvent(
    eventId: string,
    dto: UpdateEventChecklistDto,
    user: AuthenticatedUser,
  ) {
    await this.assertEventAccess(eventId, user);

    await this.ensureChecklist(eventId);

    return this.prisma.eventChecklist.update({
      where: { eventId },
      data: {
        ...(dto.carWashed !== undefined ? { carWashed: dto.carWashed } : {}),
        ...(dto.decorated !== undefined ? { decorated: dto.decorated } : {}),
        ...(dto.driverConfirmed !== undefined
          ? { driverConfirmed: dto.driverConfirmed }
          : {}),
        ...(dto.fuel !== undefined ? { fuel: dto.fuel } : {}),
        ...(dto.documentation !== undefined
          ? { documentation: dto.documentation }
          : {}),
      },
      select: checklistSelect,
    });
  }

  private async ensureChecklist(eventId: string) {
    const existing = await this.prisma.eventChecklist.findUnique({
      where: { eventId },
      select: checklistSelect,
    });

    if (existing) return existing;

    return this.prisma.eventChecklist.create({
      data: { eventId },
      select: checklistSelect,
    });
  }

  private async assertEventAccess(eventId: string, user: AuthenticatedUser) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, driverId: true },
    });

    if (!event) {
      throw new NotFoundException('Evento não encontrado');
    }

    if (user.role === UserRole.DRIVER && event.driverId !== user.id) {
      throw new NotFoundException('Evento não encontrado');
    }
  }
}
