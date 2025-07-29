import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Inject,
  Query,
  Delete,
  Patch
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Notification } from './entities/notification.entity';

@ApiTags('notifications')
@Controller('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    @Inject(REQUEST) private request: Request
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get user notifications' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of notifications to return', example: 50 })
  @ApiResponse({
    status: 200,
    description: 'Notifications fetched successfully.',
    type: [Notification]
  })
  async getUserNotifications(@Query('limit') limit?: string) {
    const user = this.request.user as any;
    const limitNumber = limit ? parseInt(limit) : 50;
    return await this.notificationsService.getUserNotifications(user.id, limitNumber);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notifications count' })
  @ApiResponse({
    status: 200,
    description: 'Unread count fetched successfully.',
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number', example: 5 }
      }
    }
  })
  async getUnreadCount() {
    const user = this.request.user as any;
    const count = await this.notificationsService.getUnreadCount(user.id);
    return { count };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as read successfully.'
  })
  async markAsRead(@Param('id') id: string) {
    const user = this.request.user as any;
    await this.notificationsService.markAsRead(+id, user.id);
    return { message: 'Notification marked as read successfully' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({
    status: 200,
    description: 'Notification deleted successfully.'
  })
  async deleteNotification(@Param('id') id: string) {
    const user = this.request.user as any;
    await this.notificationsService.deleteNotification(+id, user.id);
    return { message: 'Notification deleted successfully' };
  }

  @Post('send')
  @ApiOperation({ summary: 'Send notification manually (for testing)' })
  @ApiResponse({
    status: 201,
    description: 'Notification sent successfully.'
  })
  async sendNotification(@Body() dto: CreateNotificationDto) {
    const notification = await this.notificationsService.createNotification(dto);
    const success = await this.notificationsService.sendNotification(notification);
    
    return {
      success,
      message: success ? 'Notification sent successfully' : 'Failed to send notification',
      notificationId: notification.notificationId
    };
  }
} 