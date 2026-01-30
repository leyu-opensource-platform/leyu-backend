import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/role.guard';
import { NotificationService } from '../service/Notification.service';
import { PaginationDto } from '../dto/Pagination.dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiTags('Notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('me')
  @ApiResponse({ status: 200, description: '' })
  @ApiOperation({ summary: 'Get my notifications' })
  async myNotifications(
    @Query() paginateDto: PaginationDto,
    @Request() req,
  ): Promise<any> {
    const user = req.user;
    return this.notificationService.findPaginate(
      {
        where: { user_id: user.id },
      },
      paginateDto,
    );
  }

  @Get('count-new')
  @ApiResponse({ status: 200, description: '' })
  @ApiOperation({ summary: 'Get my notifications' })
  async countNewNotifications(@Request() req): Promise<any> {
    const user = req.user;
    return this.notificationService.countNewNotifications(user.id);
  }
}
