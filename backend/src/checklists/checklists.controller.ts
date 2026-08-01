import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/auth.decorators';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../common/decorators/current-user.decorator';
import { ChecklistsService } from './checklists.service';
import { UpdateEventChecklistDto } from './dto/update-event-checklist.dto';

@Controller('events/:eventId/checklist')
@Roles(UserRole.ADMIN, UserRole.DRIVER)
export class ChecklistsController {
  constructor(private readonly checklistsService: ChecklistsService) {}

  @Get()
  getForEvent(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.checklistsService.getForEvent(eventId, user);
  }

  @Patch()
  updateForEvent(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() dto: UpdateEventChecklistDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.checklistsService.updateForEvent(eventId, dto, user);
  }
}
